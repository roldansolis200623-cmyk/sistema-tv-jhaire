const pool = require('../config/database');

const ClienteModel = {
    crearTabla: async () => {
        const query = `
            CREATE TABLE IF NOT EXISTS clientes (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                apellido VARCHAR(100) NOT NULL,
                dni VARCHAR(20) UNIQUE NOT NULL,
                telefono VARCHAR(20),
                email VARCHAR(100),
                direccion TEXT,
                tipo_servicio VARCHAR(50) NOT NULL,
                tipo_senal VARCHAR(50),
                perfil_internet_id INTEGER,
                plan VARCHAR(100),
                precio_mensual DECIMAL(10, 2) DEFAULT 0,
                fecha_instalacion DATE,
                estado VARCHAR(20) DEFAULT 'activo',
                estado_pago VARCHAR(20) DEFAULT 'deudor',
                meses_deuda INTEGER DEFAULT 0,
                suministro VARCHAR(8) UNIQUE,
                fecha_suspension TIMESTAMP,
                motivo_suspension VARCHAR(100),
                observaciones_suspension TEXT,
                fecha_reactivacion TIMESTAMP,
                suspendido_por VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_clientes_dni ON clientes(dni);
            CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes(estado);
            CREATE INDEX IF NOT EXISTS idx_clientes_suministro ON clientes(suministro);
        `;
        
        try {
            await pool.query(query);
            console.log('✅ Tabla clientes creada/verificada');
        } catch (error) {
            console.error('Error creando tabla clientes:', error);
            throw error;
        }
    },

    getAll: async () => {
        const query = 'SELECT * FROM clientes ORDER BY created_at DESC';
        const result = await pool.query(query);
        return result.rows;
    },

    getById: async (id) => {
        const query = 'SELECT * FROM clientes WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    create: async (clienteData) => {
        const query = `
            INSERT INTO clientes (
                nombre, apellido, dni, telefono, direccion, 
                tipo_servicio, tipo_senal, perfil_internet_id,
                plan, precio_mensual, fecha_instalacion, 
                estado, meses_deuda, estado_pago, suministro
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `;
        const values = [
            clienteData.nombre,
            clienteData.apellido,
            clienteData.dni,
            clienteData.telefono,
            clienteData.direccion,
            clienteData.tipo_servicio,
            clienteData.tipo_senal || null,
            clienteData.perfil_internet_id || null,
            clienteData.plan,
            clienteData.precio_mensual,
            clienteData.fecha_instalacion,
            clienteData.estado || 'activo',
            clienteData.meses_deuda || 0,
            clienteData.estado_pago || 'deudor',
            clienteData.suministro || null
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    update: async (id, clienteData) => {
        const query = `
            UPDATE clientes SET
                nombre = $1, apellido = $2, dni = $3, telefono = $4,
                direccion = $5, tipo_servicio = $6, 
                tipo_senal = $7, perfil_internet_id = $8,
                plan = $9, precio_mensual = $10, estado = $11, 
                meses_deuda = $12, estado_pago = $13, suministro = $14, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $15
            RETURNING *
        `;
        const values = [
            clienteData.nombre,
            clienteData.apellido,
            clienteData.dni,
            clienteData.telefono,
            clienteData.direccion,
            clienteData.tipo_servicio,
            clienteData.tipo_senal || null,
            clienteData.perfil_internet_id || null,
            clienteData.plan,
            clienteData.precio_mensual,
            clienteData.estado,
            clienteData.meses_deuda || 0,
            clienteData.estado_pago || 'deudor',
            clienteData.suministro || null,
            id
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    delete: async (id) => {
        const query = 'DELETE FROM clientes WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    suspender: async (id, datos) => {
        const query = `
            UPDATE clientes SET
                estado = 'suspendido',
                fecha_suspension = CURRENT_TIMESTAMP,
                motivo_suspension = $1,
                observaciones_suspension = $2,
                suspendido_por = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        `;
        const values = [
            datos.motivo,
            datos.observaciones,
            datos.suspendido_por || 'Administrador',
            id
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    reactivar: async (id, reactivado_por) => {
        const query = `
            UPDATE clientes SET
                estado = 'activo',
                fecha_reactivacion = CURRENT_TIMESTAMP,
                motivo_suspension = NULL,
                observaciones_suspension = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    registrarSuspension: async (cliente_id, datos) => {
        const query = `
            INSERT INTO historial_suspensiones (
                cliente_id, fecha_suspension, motivo, observaciones, suspendido_por
            ) VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4)
            RETURNING *
        `;
        const values = [
            cliente_id,
            datos.motivo,
            datos.observaciones,
            datos.suspendido_por || 'Administrador'
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    registrarReactivacion: async (cliente_id, reactivado_por) => {
        const query = `
            UPDATE historial_suspensiones SET
                fecha_reactivacion = CURRENT_TIMESTAMP,
                reactivado_por = $1
            WHERE cliente_id = $2 AND fecha_reactivacion IS NULL
            RETURNING *
        `;
        const values = [reactivado_por || 'Administrador', cliente_id];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    getHistorialSuspensiones: async (cliente_id) => {
        const query = `
            SELECT * FROM historial_suspensiones 
            WHERE cliente_id = $1 
            ORDER BY fecha_suspension DESC
        `;
        const result = await pool.query(query, [cliente_id]);
        return result.rows;
    },

    registrarMigracion: async (clienteId, datosAnteriores, datosNuevos, realizadoPor, motivoCambio) => {
        const cambios = [];
        
        if (datosAnteriores.tipo_servicio !== datosNuevos.tipo_servicio) {
            cambios.push({
                tipo_cambio: 'SERVICIO',
                tipo_servicio_anterior: datosAnteriores.tipo_servicio,
                tipo_servicio_nuevo: datosNuevos.tipo_servicio
            });
        }
        
        if (datosAnteriores.plan !== datosNuevos.plan && (datosAnteriores.plan || datosNuevos.plan)) {
            cambios.push({
                tipo_cambio: 'PLAN',
                plan_anterior: datosAnteriores.plan,
                plan_nuevo: datosNuevos.plan
            });
        }
        
        if (datosAnteriores.tipo_senal !== datosNuevos.tipo_senal && (datosAnteriores.tipo_senal || datosNuevos.tipo_senal)) {
            cambios.push({
                tipo_cambio: 'SENAL',
                tipo_senal_anterior: datosAnteriores.tipo_senal,
                tipo_senal_nuevo: datosNuevos.tipo_senal
            });
        }
        
        const perfilAnterior = datosAnteriores.perfil_internet_id ? parseInt(datosAnteriores.perfil_internet_id) : null;
        const perfilNuevo = datosNuevos.perfil_internet_id ? parseInt(datosNuevos.perfil_internet_id) : null;
        
        if (perfilAnterior !== perfilNuevo) {
            cambios.push({
                tipo_cambio: 'PERFIL_INTERNET',
                perfil_internet_anterior: datosAnteriores.perfil_internet_nombre,
                perfil_internet_nuevo: datosNuevos.perfil_internet_nombre
            });
        }
        
        const precioAnterior = parseFloat(datosAnteriores.precio_mensual) || 0;
        const precioNuevo = parseFloat(datosNuevos.precio_mensual) || 0;
        
        if (precioAnterior !== precioNuevo) {
            cambios.push({
                tipo_cambio: 'PRECIO',
                precio_anterior: precioAnterior,
                precio_nuevo: precioNuevo
            });
        }
        
        const resultados = [];
        for (const cambio of cambios) {
            const query = `
                INSERT INTO historial_migraciones (
                    cliente_id, tipo_cambio,
                    tipo_servicio_anterior, tipo_servicio_nuevo,
                    plan_anterior, plan_nuevo,
                    tipo_senal_anterior, tipo_senal_nuevo,
                    perfil_internet_anterior, perfil_internet_nuevo,
                    precio_anterior, precio_nuevo,
                    realizado_por, motivo_cambio, observaciones
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                RETURNING *
            `;
            
            let observaciones = '';
            switch (cambio.tipo_cambio) {
                case 'SERVICIO':
                    observaciones = `Cambio de servicio: ${cambio.tipo_servicio_anterior} → ${cambio.tipo_servicio_nuevo}`;
                    break;
                case 'PLAN':
                    observaciones = `Cambio de plan: ${cambio.plan_anterior || 'Ninguno'} → ${cambio.plan_nuevo || 'Ninguno'}`;
                    break;
                case 'SENAL':
                    observaciones = `Cambio de señal: ${cambio.tipo_senal_anterior || 'Ninguna'} → ${cambio.tipo_senal_nuevo || 'Ninguna'}`;
                    break;
                case 'PERFIL_INTERNET':
                    observaciones = `Cambio de perfil: ${cambio.perfil_internet_anterior || 'Ninguno'} → ${cambio.perfil_internet_nuevo || 'Ninguno'}`;
                    break;
                case 'PRECIO':
                    observaciones = `Ajuste de precio: S/ ${cambio.precio_anterior.toFixed(2)} → S/ ${cambio.precio_nuevo.toFixed(2)}`;
                    break;
            }
            
            const values = [
                clienteId,
                cambio.tipo_cambio,
                cambio.tipo_servicio_anterior || null,
                cambio.tipo_servicio_nuevo || null,
                cambio.plan_anterior || null,
                cambio.plan_nuevo || null,
                cambio.tipo_senal_anterior || null,
                cambio.tipo_senal_nuevo || null,
                cambio.perfil_internet_anterior || null,
                cambio.perfil_internet_nuevo || null,
                cambio.precio_anterior || null,
                cambio.precio_nuevo || null,
                realizadoPor || 'Sistema',
                motivoCambio || 'Actualización de servicio',
                observaciones
            ];
            
            const result = await pool.query(query, values);
            resultados.push(result.rows[0]);
        }
        
        return resultados;
    },

    getHistorialMigraciones: async (clienteId) => {
        const query = `
            SELECT 
                id, tipo_cambio,
                tipo_servicio_anterior, tipo_servicio_nuevo,
                plan_anterior, plan_nuevo,
                tipo_senal_anterior, tipo_senal_nuevo,
                perfil_internet_anterior, perfil_internet_nuevo,
                precio_anterior, precio_nuevo,
                fecha_migracion, realizado_por,
                motivo_cambio, observaciones
            FROM historial_migraciones
            WHERE cliente_id = $1
            ORDER BY fecha_migracion DESC
        `;
        const result = await pool.query(query, [clienteId]);
        return result.rows;
    },

    getHistorialCompleto: async (clienteId) => {
        const suspensiones = await ClienteModel.getHistorialSuspensiones(clienteId);
        const migraciones = await ClienteModel.getHistorialMigraciones(clienteId);
        
        const historial = [
            ...suspensiones.map(s => ({ 
                ...s, 
                tipo: 'suspension',
                fecha_evento: s.fecha_suspension 
            })),
            ...migraciones.map(m => ({ 
                ...m, 
                tipo: 'migracion',
                fecha_evento: m.fecha_migracion 
            }))
        ].sort((a, b) => {
            return new Date(b.fecha_evento) - new Date(a.fecha_evento);
        });
        
        return historial;
    }
};

module.exports = ClienteModel;
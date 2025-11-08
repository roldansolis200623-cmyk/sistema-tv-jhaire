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

    // ✅ CORREGIDO: Ahora incluye EMAIL
    create: async (clienteData) => {
        const query = `
            INSERT INTO clientes (
                nombre, apellido, dni, telefono, email, direccion, 
                tipo_servicio, tipo_senal, perfil_internet_id,
                plan, precio_mensual, fecha_instalacion, 
                estado, meses_deuda, estado_pago, suministro
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *
        `;
        const values = [
            clienteData.nombre,
            clienteData.apellido,
            clienteData.dni,
            clienteData.telefono,
            clienteData.email || null, // ✅ AGREGADO
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

    // ✅ CORREGIDO: Ahora incluye EMAIL en update también
    update: async (id, clienteData) => {
        const query = `
            UPDATE clientes SET
                nombre = $1, apellido = $2, dni = $3, telefono = $4,
                email = $5, direccion = $6, tipo_servicio = $7, 
                tipo_senal = $8, perfil_internet_id = $9,
                plan = $10, precio_mensual = $11, estado = $12, 
                meses_deuda = $13, estado_pago = $14, suministro = $15, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $16
            RETURNING *
        `;
        const values = [
            clienteData.nombre,
            clienteData.apellido,
            clienteData.dni,
            clienteData.telefono,
            clienteData.email || null, // ✅ AGREGADO
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

    reactivar: async (id, reactivado_por = 'Administrador') => {
        const query = `
            UPDATE clientes SET
                estado = 'activo',
                fecha_reactivacion = CURRENT_TIMESTAMP,
                suspendido_por = NULL,
                motivo_suspension = NULL,
                observaciones_suspension = NULL,
                fecha_suspension = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    registrarSuspension: async (clienteId, datos) => {
        const query = `
            INSERT INTO historial_suspensiones (
                cliente_id, motivo, observaciones, suspendido_por
            ) VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [
            clienteId,
            datos.motivo,
            datos.observaciones,
            datos.suspendido_por
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    registrarReactivacion: async (clienteId, reactivado_por) => {
        const query = `
            INSERT INTO historial_reactivaciones (
                cliente_id, reactivado_por
            ) VALUES ($1, $2)
            RETURNING *
        `;
        const result = await pool.query(query, [clienteId, reactivado_por]);
        return result.rows[0];
    },

    getHistorialSuspensiones: async (clienteId) => {
        const query = `
            SELECT * FROM historial_suspensiones
            WHERE cliente_id = $1
            ORDER BY fecha_suspension DESC
        `;
        const result = await pool.query(query, [clienteId]);
        return result.rows;
    },

    /**
     * ✅ NUEVO: Registrar migración de cliente
     */
    registrarMigracion: async (clienteId, datosAnteriores, datosNuevos, realizadoPor, motivo) => {
        const migraciones = [];
        
        // Detectar cambios y crear registro por cada uno
        const campos = [
            { key: 'tipo_servicio', nombre: 'Tipo de Servicio' },
            { key: 'plan', nombre: 'Plan' },
            { key: 'tipo_senal', nombre: 'Tipo de Señal' },
            { key: 'perfil_internet_nombre', nombre: 'Perfil Internet' },
            { key: 'precio_mensual', nombre: 'Precio Mensual' }
        ];

        for (const campo of campos) {
            if (datosAnteriores[campo.key] !== datosNuevos[campo.key]) {
                const query = `
                    INSERT INTO migraciones_clientes (
                        cliente_id, campo_modificado, valor_anterior, 
                        valor_nuevo, realizado_por, motivo
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *
                `;
                
                const values = [
                    clienteId,
                    campo.nombre,
                    datosAnteriores[campo.key]?.toString() || 'N/A',
                    datosNuevos[campo.key]?.toString() || 'N/A',
                    realizadoPor,
                    motivo
                ];

                const result = await pool.query(query, values);
                migraciones.push(result.rows[0]);
            }
        }

        return migraciones;
    },

    /**
     * ✅ NUEVO: Obtener historial de migraciones
     */
    getHistorialMigraciones: async (clienteId) => {
        const query = `
            SELECT * FROM migraciones_clientes
            WHERE cliente_id = $1
            ORDER BY fecha_migracion DESC
        `;
        const result = await pool.query(query, [clienteId]);
        return result.rows;
    },

    /**
     * ✅ NUEVO: Obtener historial completo (suspensiones + migraciones)
     */
    getHistorialCompleto: async (clienteId) => {
        const suspensiones = await ClienteModel.getHistorialSuspensiones(clienteId);
        const migraciones = await ClienteModel.getHistorialMigraciones(clienteId);
        
        return {
            suspensiones,
            migraciones
        };
    }
};

module.exports = ClienteModel;
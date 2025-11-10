const pool = require('../config/database');

const Cliente = {
    async getAll() {
        try {
            const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
            return result.rows;
        } catch (error) {
            console.error('Error en getAll:', error);
            throw error;
        }
    },
    async getById(id) {
        try {
            const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error en getById:', error);
            throw error;
        }
    },

    async create(data) {
        const {
            nombre, apellido, dni, telefono, correo, direccion,
            numero_suministro, tipo_servicio, tipo_senal, perfil_internet_id,
            plan, precio_mensual, fecha_instalacion,
            estado = 'activo', estado_pago = 'al_dia', meses_deuda = 0
        } = data;

        try {
            const result = await pool.query(`
                INSERT INTO clientes (
                    nombre, apellido, dni, telefono, correo, direccion,
                    numero_suministro, tipo_servicio, tipo_senal, perfil_internet_id,
                    plan, precio_mensual, fecha_instalacion, estado, estado_pago, meses_deuda
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                RETURNING *
            `, [
                nombre, apellido, dni, telefono, correo, direccion,
                numero_suministro, tipo_servicio, tipo_senal, perfil_internet_id || null,
                plan, precio_mensual, fecha_instalacion, estado, estado_pago, meses_deuda
            ]);
            return result.rows[0];
        } catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    },

    // ✅ UPDATE CON CONVERSIÓN DE STRINGS VACÍOS A NULL
    async update(id, data) {
        try {
            console.log(`📝 Actualizando cliente ${id} con datos:`, data);
            
            // ✅ CONVERTIR STRINGS VACÍOS A NULL para campos INTEGER
            if (data.perfil_internet_id === '') {
                data.perfil_internet_id = null;
            }
            if (data.plan === '') {
                data.plan = null;
            }
            
            const fields = [];
            const values = [];
            let paramCount = 1;
            
            const allowedFields = [
                'nombre', 'apellido', 'dni', 'telefono', 'correo', 'direccion',
                'numero_suministro', 'tipo_servicio', 'tipo_senal', 'perfil_internet_id',
                'plan', 'precio_mensual', 'fecha_instalacion', 'estado', 'estado_pago', 'meses_deuda'
            ];
            
            allowedFields.forEach(field => {
                if (data[field] !== undefined) {
                    const value = data[field];
                    fields.push(`${field} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            
            if (fields.length === 0) {
                console.log('⚠️ No hay campos para actualizar');
                return await this.getById(id);
            }
            
            values.push(id);
            
            const query = `UPDATE clientes SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
            
            console.log('🔍 Query:', query);
            console.log('🔍 Values:', values);
            
            const result = await pool.query(query, values);
            
            if (result.rows.length === 0) {
                console.log('❌ Cliente no encontrado');
                return null;
            }
            
            console.log('✅ Cliente actualizado exitosamente');
            return result.rows[0];
            
        } catch (error) {
            console.error('❌ Error en update:', error);
            throw error;
        }
    },

    async delete(id) {
        try {
            const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error en delete:', error);
            throw error;
        }
    },

    async reactivar(id) {
        try {
            console.log(`🔄 Reactivando cliente ID: ${id}`);
            
            const result = await pool.query('UPDATE clientes SET estado = $1 WHERE id = $2 RETURNING *', ['activo', id]);
            
            if (result.rows.length === 0) {
                console.log('❌ Cliente no encontrado');
                return null;
            }
            
            console.log('✅ Cliente reactivado');
            
            return result.rows[0];
            
        } catch (error) {
            console.error('❌ Error en reactivar:', error);
            throw error;
        }
    },

    async suspender(id) {
        try {
            const result = await pool.query('UPDATE clientes SET estado = $1 WHERE id = $2 RETURNING *', ['suspendido', id]);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error en suspender:', error);
            throw error;
        }
    },

    async getDeudores() {
        try {
            const result = await pool.query('SELECT * FROM clientes WHERE meses_deuda > 0 ORDER BY meses_deuda DESC');
            return result.rows;
        } catch (error) {
            console.error('Error en getDeudores:', error);
            throw error;
        }
    },

    async getEstadisticas() {
        try {
            const result = await pool.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE estado = 'activo') as activos,
                    COUNT(*) FILTER (WHERE estado = 'suspendido') as suspendidos,
                    COUNT(*) FILTER (WHERE meses_deuda = 0) as al_dia,
                    COUNT(*) FILTER (WHERE meses_deuda > 0 AND meses_deuda < 3) as deudores,
                    COUNT(*) FILTER (WHERE meses_deuda >= 3) as morosos,
                    COALESCE(SUM(precio_mensual), 0) as ingreso_mensual_total,
                    COALESCE(SUM(meses_deuda * precio_mensual), 0) as deuda_total
                FROM clientes
            `);
            return result.rows[0];
        } catch (error) {
            console.error('Error en getEstadisticas:', error);
            throw error;
        }
    },

    async buscar(query) {
        try {
            const searchPattern = `%${query}%`;
            const result = await pool.query(`
                SELECT * FROM clientes
                WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR dni ILIKE $1 OR telefono ILIKE $1
                ORDER BY id DESC LIMIT 50
            `, [searchPattern]);
            return result.rows;
        } catch (error) {
            console.error('Error en buscar:', error);
            throw error;
        }
    },

    // ✅ REGISTRAR SUSPENSIÓN
    async registrarSuspension(id, datos) {
        try {
            console.log(`📌 Registrando suspensión del cliente ${id}`);
            
            const result = await pool.query(`
                INSERT INTO historial_suspensiones (
                    cliente_id, motivo, observaciones, suspendido_por, fecha_suspension
                ) VALUES ($1, $2, $3, $4, NOW())
                RETURNING *
            `, [
                id,
                datos.motivo || null,
                datos.observaciones || null,
                datos.suspendido_por || 'Administrador'
            ]);
            
            console.log('✅ Suspensión registrada');
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error registrando suspensión:', error);
            throw error;
        }
    },

    // ✅ REGISTRAR MIGRACIONES (cambios en cliente)
    async registrarMigracion(id, clienteAnterior, clienteNuevo, usuario, motivo) {
        try {
            console.log(`📌 Registrando migraciones del cliente ${id}`);
            
            const migraciones = [];
            
            // Detectar cambios
            if (clienteAnterior.tipo_servicio !== clienteNuevo.tipo_servicio) {
                const result = await pool.query(`
                    INSERT INTO historial_migraciones (
                        cliente_id, tipo_cambio, valor_anterior, valor_nuevo, 
                        realizado_por, motivo_cambio, fecha_cambio
                    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
                    RETURNING *
                `, [
                    id, 'SERVICIO', clienteAnterior.tipo_servicio, clienteNuevo.tipo_servicio,
                    usuario, motivo
                ]);
                migraciones.push(result.rows[0]);
            }
            
            if (clienteAnterior.plan !== clienteNuevo.plan) {
                const result = await pool.query(`
                    INSERT INTO historial_migraciones (
                        cliente_id, tipo_cambio, valor_anterior, valor_nuevo, 
                        realizado_por, motivo_cambio, fecha_cambio
                    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
                    RETURNING *
                `, [
                    id, 'PLAN', clienteAnterior.plan, clienteNuevo.plan,
                    usuario, motivo
                ]);
                migraciones.push(result.rows[0]);
            }
            
            if (clienteAnterior.tipo_senal !== clienteNuevo.tipo_senal) {
                const result = await pool.query(`
                    INSERT INTO historial_migraciones (
                        cliente_id, tipo_cambio, valor_anterior, valor_nuevo, 
                        realizado_por, motivo_cambio, fecha_cambio
                    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
                    RETURNING *
                `, [
                    id, 'SENAL', clienteAnterior.tipo_senal, clienteNuevo.tipo_senal,
                    usuario, motivo
                ]);
                migraciones.push(result.rows[0]);
            }
            
            if (clienteAnterior.perfil_internet_id !== clienteNuevo.perfil_internet_id) {
                const result = await pool.query(`
                    INSERT INTO historial_migraciones (
                        cliente_id, tipo_cambio, valor_anterior, valor_nuevo, 
                        realizado_por, motivo_cambio, fecha_cambio
                    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
                    RETURNING *
                `, [
                    id, 'PERFIL_INTERNET', 
                    clienteAnterior.perfil_internet_nombre || clienteAnterior.perfil_internet_id,
                    clienteNuevo.perfil_internet_nombre || clienteNuevo.perfil_internet_id,
                    usuario, motivo
                ]);
                migraciones.push(result.rows[0]);
            }
            
            if (parseFloat(clienteAnterior.precio_mensual) !== parseFloat(clienteNuevo.precio_mensual)) {
                const result = await pool.query(`
                    INSERT INTO historial_migraciones (
                        cliente_id, tipo_cambio, valor_anterior, valor_nuevo, 
                        realizado_por, motivo_cambio, fecha_cambio
                    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
                    RETURNING *
                `, [
                    id, 'PRECIO', clienteAnterior.precio_mensual, clienteNuevo.precio_mensual,
                    usuario, motivo
                ]);
                migraciones.push(result.rows[0]);
            }
            
            console.log(`✅ ${migraciones.length} migraciones registradas`);
            return migraciones;
        } catch (error) {
            console.error('❌ Error registrando migraciones:', error);
            throw error;
        }
    },

    // ✅ OBTENER HISTORIAL DE SUSPENSIONES
    async getHistorialSuspensiones(id) {
        try {
            console.log(`🔍 Obteniendo suspensiones del cliente ${id}`);
            
            const result = await pool.query(`
                SELECT * FROM historial_suspensiones
                WHERE cliente_id = $1
                ORDER BY fecha_suspension DESC
            `, [id]);
            
            return result.rows;
        } catch (error) {
            console.error('❌ Error obteniendo suspensiones:', error);
            throw error;
        }
    },

    // ✅ OBTENER HISTORIAL DE MIGRACIONES
    async getHistorialMigraciones(id) {
        try {
            console.log(`🔍 Obteniendo migraciones del cliente ${id}`);
            
            const result = await pool.query(`
                SELECT * FROM historial_migraciones
                WHERE cliente_id = $1
                ORDER BY fecha_cambio DESC
            `, [id]);
            
            return result.rows;
        } catch (error) {
            console.error('❌ Error obteniendo migraciones:', error);
            throw error;
        }
    },

    // ✅ OBTENER HISTORIAL COMPLETO (Suspensiones + Migraciones)
    async getHistorialCompleto(id) {
        try {
            console.log(`🔍 Obteniendo historial completo del cliente ${id}`);
            
            // Obtener suspensiones
            const suspensiones = await pool.query(`
                SELECT 
                    'suspension' as tipo,
                    fecha_suspension as fecha_evento,
                    motivo,
                    observaciones,
                    suspendido_por,
                    fecha_reactivacion
                FROM historial_suspensiones
                WHERE cliente_id = $1
                ORDER BY fecha_suspension DESC
            `, [id]);
            
            // Obtener migraciones
            const migraciones = await pool.query(`
                SELECT 
                    'migracion' as tipo,
                    fecha_cambio as fecha_evento,
                    tipo_cambio,
                    valor_anterior,
                    valor_nuevo,
                    realizado_por,
                    motivo_cambio
                FROM historial_migraciones
                WHERE cliente_id = $1
                ORDER BY fecha_cambio DESC
            `, [id]);
            
            // Combinar y ordenar por fecha
            const historialCombinado = [
                ...suspensiones.rows,
                ...migraciones.rows
            ].sort((a, b) => new Date(b.fecha_evento) - new Date(a.fecha_evento));
            
            console.log(`✅ Historial completo obtenido: ${historialCombinado.length} eventos`);
            return historialCombinado;
        } catch (error) {
            console.error('❌ Error en getHistorialCompleto:', error);
            throw error;
        }
    }
};

module.exports = Cliente;
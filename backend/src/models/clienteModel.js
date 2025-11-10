const pool = require('../config/database');

const Cliente = {
    // Obtener todos los clientes
    async getAll() {
        try {
            const result = await pool.query(`
                SELECT 
                    c.*,
                    COALESCE(c.deuda_total, c.meses_deuda * c.precio_mensual) as deuda_calculada
                FROM clientes c
                ORDER BY c.id DESC
            `);
            return result.rows;
        } catch (error) {
            console.error('Error en getAll:', error);
            throw error;
        }
    },

    // Obtener cliente por ID
    async getById(id) {
        try {
            const result = await pool.query(`
                SELECT 
                    c.*,
                    COALESCE(c.deuda_total, c.meses_deuda * c.precio_mensual) as deuda_calculada
                FROM clientes c
                WHERE c.id = $1
            `, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error en getById:', error);
            throw error;
        }
    },

    // Crear nuevo cliente
    async create(data) {
        const {
            nombre,
            apellido,
            dni,
            telefono,
            correo,
            direccion,
            numero_suministro,
            tipo_servicio,
            tipo_senal,
            perfil_internet_id,
            plan,
            precio_mensual,
            fecha_instalacion,
            estado = 'activo',
            estado_pago = 'al_dia',
            meses_deuda = 0
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
                numero_suministro, tipo_servicio, tipo_senal, perfil_internet_id,
                plan, precio_mensual, fecha_instalacion, estado, estado_pago, meses_deuda
            ]);

            return result.rows[0];
        } catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    },

    // REEMPLAZAR ESTE MÉTODO en tu clienteModel.js actual:

async update(id, data) {
    try {
        console.log(`📝 Actualizando cliente ${id} con:`, data);
        
        // Construir query dinámicamente solo con campos que vienen
        const fields = [];
        const values = [];
        let paramCount = 1;
        
        const allowedFields = [
            'nombre', 'apellido', 'dni', 'telefono', 'correo', 'direccion',
            'numero_suministro', 'tipo_servicio', 'tipo_senal', 'perfil_internet_id',
            'plan', 'precio_mensual', 'fecha_instalacion', 'estado', 'estado_pago', 'meses_deuda'
        ];
        
        allowedFields.forEach(field => {
            if (data[field] !== undefined && data[field] !== null) {
                fields.push(`${field} = $${paramCount}`);
                values.push(data[field]);
                paramCount++;
            }
        });
        
        if (fields.length === 0) {
            console.log('⚠️ No hay campos para actualizar');
            return await this.getById(id);
        }
        
        // Agregar fecha_actualizacion
        fields.push(`fecha_actualizacion = CURRENT_TIMESTAMP`);
        
        // Agregar ID al final
        values.push(id);
        
        const query = `
            UPDATE clientes 
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;
        
        console.log('🔍 Query:', query);
        console.log('🔍 Values:', values);
        
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            console.log('❌ Cliente no encontrado');
            return null;
        }
        
        console.log('✅ Cliente actualizado');
        return result.rows[0];
        
    } catch (error) {
        console.error('❌ Error en update:', error);
        throw error;
    }
},

    // Eliminar cliente
    async delete(id) {
        try {
            const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error en delete:', error);
            throw error;
        }
    },

    // ✅✅✅ REACTIVAR CLIENTE - CON TODAS LAS COLUMNAS DE LA TABLA
    async reactivar(id) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            console.log(`🔄 Reactivando cliente ID: ${id}`);
            
            // 1. Obtener cliente actual
            const clienteResult = await client.query('SELECT * FROM clientes WHERE id = $1', [id]);
            
            if (clienteResult.rows.length === 0) {
                await client.query('ROLLBACK');
                console.log('❌ Cliente no encontrado');
                return null;
            }
            
            const estadoAnterior = clienteResult.rows[0].estado;
            console.log(`📊 Estado anterior: ${estadoAnterior}`);
            
            // 2. Actualizar estado a activo
            const updateResult = await client.query(`
                UPDATE clientes 
                SET 
                    estado = 'activo',
                    fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `, [id]);
            
            console.log('✅ Cliente actualizado a activo');
            
            // 3. ✅ Registrar en historial con TODAS las columnas
            try {
                await client.query(`
                    INSERT INTO historial_reactivaciones (
                        cliente_id,
                        fecha_reactivacion,
                        usuario,
                        motivo,
                        estado_anterior,
                        estado_nuevo,
                        notas
                    ) VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, $5, $6)
                `, [
                    id,
                    'Sistema',
                    'Reactivación manual desde panel',
                    estadoAnterior,
                    'activo',
                    `Cliente reactivado. Estado anterior: ${estadoAnterior}`
                ]);
                
                console.log('✅ Historial registrado correctamente');
            } catch (histError) {
                console.error('⚠️ Error al registrar historial:', histError.message);
                console.error('⚠️ Detalle completo:', histError);
                // NO hacer rollback - la reactivación ya está hecha
            }
            
            await client.query('COMMIT');
            
            console.log('✅ Reactivación completada exitosamente');
            return updateResult.rows[0];
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error crítico en reactivar:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    // Suspender cliente
    async suspender(id) {
        try {
            console.log(`⏸️ Suspendiendo cliente ID: ${id}`);
            
            const result = await pool.query(`
                UPDATE clientes 
                SET 
                    estado = 'suspendido',
                    fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `, [id]);

            if (result.rows.length === 0) {
                console.log('❌ No se encontró el cliente para suspender');
                return null;
            }

            console.log('✅ Cliente suspendido en BD');
            return result.rows[0];
            
        } catch (error) {
            console.error('❌ Error en suspender:', error);
            throw error;
        }
    },

    // Obtener clientes deudores
    async getDeudores() {
        try {
            const result = await pool.query(`
                SELECT 
                    c.*,
                    COALESCE(c.deuda_total, c.meses_deuda * c.precio_mensual) as deuda_calculada
                FROM clientes c
                WHERE c.meses_deuda > 0
                ORDER BY c.meses_deuda DESC, c.id DESC
            `);
            return result.rows;
        } catch (error) {
            console.error('Error en getDeudores:', error);
            throw error;
        }
    },

    // Obtener estadísticas
    async getEstadisticas() {
        try {
            const result = await pool.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE estado = 'activo') as activos,
                    COUNT(*) FILTER (WHERE estado = 'suspendido') as suspendidos,
                    COUNT(*) FILTER (WHERE estado = 'cancelado') as cancelados,
                    COUNT(*) FILTER (WHERE meses_deuda = 0) as al_dia,
                    COUNT(*) FILTER (WHERE meses_deuda > 0 AND meses_deuda < 3) as deudores,
                    COUNT(*) FILTER (WHERE meses_deuda >= 3) as morosos,
                    COALESCE(SUM(precio_mensual), 0) as ingreso_mensual_total,
                    COALESCE(SUM(CASE WHEN estado = 'activo' THEN precio_mensual ELSE 0 END), 0) as ingreso_activos,
                    COALESCE(SUM(meses_deuda * precio_mensual), 0) as deuda_total
                FROM clientes
            `);
            return result.rows[0];
        } catch (error) {
            console.error('Error en getEstadisticas:', error);
            throw error;
        }
    },

    // Buscar clientes
    async buscar(query) {
        try {
            const searchPattern = `%${query}%`;
            const result = await pool.query(`
                SELECT 
                    c.*,
                    COALESCE(c.deuda_total, c.meses_deuda * c.precio_mensual) as deuda_calculada
                FROM clientes c
                WHERE 
                    c.nombre ILIKE $1 OR
                    c.apellido ILIKE $1 OR
                    c.dni ILIKE $1 OR
                    c.telefono ILIKE $1 OR
                    c.direccion ILIKE $1
                ORDER BY c.id DESC
                LIMIT 50
            `, [searchPattern]);
            return result.rows;
        } catch (error) {
            console.error('Error en buscar:', error);
            throw error;
        }
    }
};

module.exports = Cliente;
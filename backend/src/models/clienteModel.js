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

    // Actualizar cliente
    async update(id, data) {
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
            estado,
            estado_pago,
            meses_deuda
        } = data;

        try {
            const result = await pool.query(`
                UPDATE clientes SET
                    nombre = COALESCE($1, nombre),
                    apellido = COALESCE($2, apellido),
                    dni = COALESCE($3, dni),
                    telefono = COALESCE($4, telefono),
                    correo = COALESCE($5, correo),
                    direccion = COALESCE($6, direccion),
                    numero_suministro = COALESCE($7, numero_suministro),
                    tipo_servicio = COALESCE($8, tipo_servicio),
                    tipo_senal = COALESCE($9, tipo_senal),
                    perfil_internet_id = COALESCE($10, perfil_internet_id),
                    plan = COALESCE($11, plan),
                    precio_mensual = COALESCE($12, precio_mensual),
                    fecha_instalacion = COALESCE($13, fecha_instalacion),
                    estado = COALESCE($14, estado),
                    estado_pago = COALESCE($15, estado_pago),
                    meses_deuda = COALESCE($16, meses_deuda),
                    fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE id = $17
                RETURNING *
            `, [
                nombre, apellido, dni, telefono, correo, direccion,
                numero_suministro, tipo_servicio, tipo_senal, perfil_internet_id,
                plan, precio_mensual, fecha_instalacion, estado, estado_pago, meses_deuda, id
            ]);

            return result.rows[0];
        } catch (error) {
            console.error('Error en update:', error);
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

    // ✅ REACTIVAR CLIENTE - SIN HISTORIAL (O CON MANEJO DE ERROR)
    async reactivar(id) {
        try {
            console.log(`🔄 Reactivando cliente ID: ${id}`);
            
            // Obtener estado anterior
            const clienteAnterior = await this.getById(id);
            if (!clienteAnterior) {
                console.log('❌ Cliente no encontrado');
                return null;
            }
            
            console.log(`📊 Estado anterior: ${clienteAnterior.estado}`);
            
            // Actualizar el estado a 'activo'
            const result = await pool.query(`
                UPDATE clientes 
                SET 
                    estado = 'activo',
                    fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `, [id]);

            if (result.rows.length === 0) {
                console.log('❌ No se pudo actualizar el cliente');
                return null;
            }

            console.log('✅ Cliente reactivado en BD');
            
            // ✅ INTENTAR registrar en historial (sin romper si no existe la tabla)
            try {
                await pool.query(`
                    INSERT INTO historial_reactivaciones (
                        cliente_id,
                        fecha_reactivacion,
                        estado_anterior,
                        estado_nuevo,
                        notas
                    ) VALUES ($1, CURRENT_TIMESTAMP, $2, 'activo', 'Reactivación manual')
                `, [id, clienteAnterior.estado]);
                
                console.log('✅ Historial registrado');
            } catch (historialError) {
                // Si falla el historial, NO romper la reactivación
                console.log('⚠️ No se pudo registrar historial (tabla no existe), pero cliente reactivado correctamente');
            }
            
            return result.rows[0];
            
        } catch (error) {
            console.error('❌ Error en reactivar:', error);
            throw error;
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
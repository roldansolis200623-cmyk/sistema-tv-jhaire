const pool = require('../config/database');

const NotificacionModel = {
    /**
     * Crear tabla si no existe
     */
    async crearTabla() {
        const query = `
            CREATE TABLE IF NOT EXISTS notificaciones (
                id SERIAL PRIMARY KEY,
                tipo VARCHAR(50) NOT NULL,
                titulo VARCHAR(255) NOT NULL,
                mensaje TEXT NOT NULL,
                icono VARCHAR(50),
                color VARCHAR(20),
                cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                pago_id INTEGER REFERENCES pagos(id) ON DELETE CASCADE,
                url VARCHAR(255),
                leida BOOLEAN DEFAULT FALSE,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_leida TIMESTAMP,
                usuario_id INTEGER
            );

            CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
            CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha ON notificaciones(fecha_creacion DESC);
            CREATE INDEX IF NOT EXISTS idx_notificaciones_cliente ON notificaciones(cliente_id);
            CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON notificaciones(tipo);
        `;
        
        try {
            await pool.query(query);
            console.log('✅ Tabla notificaciones creada/verificada');
        } catch (error) {
            console.error('❌ Error creando tabla notificaciones:', error);
            throw error;
        }
    },

    /**
     * Crear una nueva notificación
     */
    async crear(notificacion) {
        const { tipo, titulo, mensaje, icono, color, cliente_id, pago_id, url } = notificacion;
        
        const query = `
            INSERT INTO notificaciones (tipo, titulo, mensaje, icono, color, cliente_id, pago_id, url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        
        const values = [tipo, titulo, mensaje, icono || 'info', color || 'blue', cliente_id, pago_id, url];
        
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creando notificación:', error);
            throw error;
        }
    },

    /**
     * Obtener todas las notificaciones (con límite)
     */
    async getAll(limite = 50) {
        const query = `
            SELECT 
                n.*,
                c.nombre as cliente_nombre,
                c.apellido as cliente_apellido
            FROM notificaciones n
            LEFT JOIN clientes c ON n.cliente_id = c.id
            ORDER BY n.fecha_creacion DESC
            LIMIT $1
        `;
        
        try {
            const result = await pool.query(query, [limite]);
            return result.rows;
        } catch (error) {
            console.error('Error obteniendo notificaciones:', error);
            throw error;
        }
    },

    /**
     * Obtener notificaciones no leídas
     */
    async getNoLeidas() {
        const query = `
            SELECT 
                n.*,
                c.nombre as cliente_nombre,
                c.apellido as cliente_apellido
            FROM notificaciones n
            LEFT JOIN clientes c ON n.cliente_id = c.id
            WHERE n.leida = FALSE
            ORDER BY n.fecha_creacion DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error obteniendo notificaciones no leídas:', error);
            throw error;
        }
    },

    /**
     * Contar notificaciones no leídas
     */
    async contarNoLeidas() {
        const query = 'SELECT COUNT(*) as total FROM notificaciones WHERE leida = FALSE';
        
        try {
            const result = await pool.query(query);
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error('Error contando notificaciones no leídas:', error);
            throw error;
        }
    },

    /**
     * Marcar notificación como leída
     */
    async marcarComoLeida(id) {
        const query = `
            UPDATE notificaciones 
            SET leida = TRUE, fecha_leida = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error marcando notificación como leída:', error);
            throw error;
        }
    },

    /**
     * Marcar todas como leídas
     */
    async marcarTodasComoLeidas() {
        const query = `
            UPDATE notificaciones 
            SET leida = TRUE, fecha_leida = CURRENT_TIMESTAMP
            WHERE leida = FALSE
            RETURNING *
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error marcando todas como leídas:', error);
            throw error;
        }
    },

    /**
     * Eliminar notificación
     */
    async eliminar(id) {
        const query = 'DELETE FROM notificaciones WHERE id = $1 RETURNING *';
        
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error eliminando notificación:', error);
            throw error;
        }
    },

    /**
     * Eliminar notificaciones antiguas (más de 30 días)
     */
    async limpiarAntiguas() {
        const query = `
            DELETE FROM notificaciones 
            WHERE fecha_creacion < NOW() - INTERVAL '30 days'
            AND leida = TRUE
            RETURNING *
        `;
        
        try {
            const result = await pool.query(query);
            console.log(`🧹 Limpiadas ${result.rows.length} notificaciones antiguas`);
            return result.rows;
        } catch (error) {
            console.error('Error limpiando notificaciones antiguas:', error);
            throw error;
        }
    },

    /**
     * Obtener notificaciones por cliente
     */
    async getPorCliente(cliente_id) {
        const query = `
            SELECT * FROM notificaciones
            WHERE cliente_id = $1
            ORDER BY fecha_creacion DESC
            LIMIT 20
        `;
        
        try {
            const result = await pool.query(query, [cliente_id]);
            return result.rows;
        } catch (error) {
            console.error('Error obteniendo notificaciones del cliente:', error);
            throw error;
        }
    }
};

module.exports = NotificacionModel;
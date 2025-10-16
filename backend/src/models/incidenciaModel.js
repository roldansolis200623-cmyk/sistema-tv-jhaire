const pool = require('../config/database');

const IncidenciaModel = {
    // Crear tabla (ya está en el SQL de arriba, pero por si acaso)
    crearTabla: async () => {
        const query = `
            CREATE TABLE IF NOT EXISTS incidencias (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER NOT NULL,
                tipo VARCHAR(50) NOT NULL,
                titulo VARCHAR(200) NOT NULL,
                descripcion TEXT NOT NULL,
                estado VARCHAR(20) DEFAULT 'pendiente',
                prioridad VARCHAR(20) DEFAULT 'media',
                fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_inicio_atencion TIMESTAMP,
                fecha_resolucion TIMESTAMP,
                tiempo_resolucion INTEGER,
                tecnico_asignado VARCHAR(100),
                observaciones TEXT,
                solucion TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
            );
        `;
        
        try {
            await pool.query(query);
            console.log('✅ Tabla incidencias creada/verificada');
        } catch (error) {
            console.error('Error creando tabla incidencias:', error);
            throw error;
        }
    },

    // Obtener todas las incidencias con datos del cliente
    getAll: async () => {
        const query = `
            SELECT 
                i.*,
                c.nombre || ' ' || c.apellido as cliente_nombre,
                c.dni,
                c.telefono,
                c.direccion,
                c.tipo_servicio
            FROM incidencias i
            JOIN clientes c ON i.cliente_id = c.id
            ORDER BY 
                CASE i.estado 
                    WHEN 'pendiente' THEN 1
                    WHEN 'en_proceso' THEN 2
                    WHEN 'resuelto' THEN 3
                    WHEN 'cancelado' THEN 4
                END,
                i.fecha_reporte DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    // Obtener incidencias por cliente
    getByCliente: async (clienteId) => {
        const query = `
            SELECT * FROM incidencias 
            WHERE cliente_id = $1 
            ORDER BY fecha_reporte DESC
        `;
        const result = await pool.query(query, [clienteId]);
        return result.rows;
    },

    // Obtener incidencia por ID
    getById: async (id) => {
        const query = `
            SELECT 
                i.*,
                c.nombre || ' ' || c.apellido as cliente_nombre,
                c.dni,
                c.telefono,
                c.direccion,
                c.tipo_servicio
            FROM incidencias i
            JOIN clientes c ON i.cliente_id = c.id
            WHERE i.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    // Crear nueva incidencia
    create: async (data) => {
        const query = `
            INSERT INTO incidencias (
                cliente_id, tipo, titulo, descripcion, 
                prioridad, tecnico_asignado, observaciones
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [
            data.cliente_id,
            data.tipo,
            data.titulo,
            data.descripcion,
            data.prioridad || 'media',
            data.tecnico_asignado || null,
            data.observaciones || null
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Actualizar incidencia
    update: async (id, data) => {
        const query = `
            UPDATE incidencias SET
                tipo = $1,
                titulo = $2,
                descripcion = $3,
                estado = $4,
                prioridad = $5,
                tecnico_asignado = $6,
                observaciones = $7,
                solucion = $8,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $9
            RETURNING *
        `;
        const values = [
            data.tipo,
            data.titulo,
            data.descripcion,
            data.estado,
            data.prioridad,
            data.tecnico_asignado,
            data.observaciones,
            data.solucion,
            id
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Iniciar atención
    iniciarAtencion: async (id, tecnico) => {
        const query = `
            UPDATE incidencias SET
                estado = 'en_proceso',
                fecha_inicio_atencion = CURRENT_TIMESTAMP,
                tecnico_asignado = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const result = await pool.query(query, [tecnico, id]);
        return result.rows[0];
    },

    // Resolver incidencia
    resolver: async (id, solucion, tecnico) => {
        const query = `
            UPDATE incidencias SET
                estado = 'resuelto',
                fecha_resolucion = CURRENT_TIMESTAMP,
                solucion = $1,
                tecnico_asignado = COALESCE(tecnico_asignado, $2),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `;
        const result = await pool.query(query, [solucion, tecnico, id]);
        return result.rows[0];
    },

    // Cancelar incidencia
    cancelar: async (id, motivo) => {
        const query = `
            UPDATE incidencias SET
                estado = 'cancelado',
                observaciones = COALESCE(observaciones || E'\n\n', '') || 'CANCELADO: ' || $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const result = await pool.query(query, [motivo, id]);
        return result.rows[0];
    },

    // Eliminar incidencia
    delete: async (id) => {
        const query = 'DELETE FROM incidencias WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    // Estadísticas
    getEstadisticas: async () => {
        const query = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
                COUNT(*) FILTER (WHERE estado = 'en_proceso') as en_proceso,
                COUNT(*) FILTER (WHERE estado = 'resuelto') as resueltas,
                COUNT(*) FILTER (WHERE estado = 'cancelado') as canceladas,
                AVG(tiempo_resolucion) FILTER (WHERE tiempo_resolucion IS NOT NULL) as tiempo_promedio_resolucion,
                COUNT(*) FILTER (WHERE tipo = 'averia') as averias,
                COUNT(*) FILTER (WHERE tipo = 'soporte') as soportes,
                COUNT(*) FILTER (WHERE tipo = 'mantenimiento') as mantenimientos
            FROM incidencias
        `;
        const result = await pool.query(query);
        return result.rows[0];
    },

    // Incidencias del día
    getHoy: async () => {
        const query = `
            SELECT 
                i.*,
                c.nombre || ' ' || c.apellido as cliente_nombre,
                c.telefono,
                c.direccion
            FROM incidencias i
            JOIN clientes c ON i.cliente_id = c.id
            WHERE DATE(i.fecha_reporte) = CURRENT_DATE
            ORDER BY i.fecha_reporte DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }
};

module.exports = IncidenciaModel;
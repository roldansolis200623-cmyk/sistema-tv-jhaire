// ============================================
// backend/routes/notificaciones.js
// RUTAS DE NOTIFICACIONES - COMPLETAS Y SIN ERRORES
// CREAR ESTE ARCHIVO
// ============================================

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Configuración de PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ============================================
// GET - Obtener todas las notificaciones
// ============================================
router.get('/', async (req, res) => {
    try {
        const { 
            tipo, 
            prioridad, 
            leida, 
            archivada = 'false',
            limit = 50,
            offset = 0 
        } = req.query;
        
        let query = 'SELECT * FROM notificaciones_inteligentes WHERE archivada = $1';
        const params = [archivada === 'true'];
        let paramIndex = 2;
        
        if (tipo) {
            query += ` AND tipo = $${paramIndex}`;
            params.push(tipo);
            paramIndex++;
        }
        
        if (prioridad) {
            query += ` AND prioridad = $${paramIndex}`;
            params.push(prioridad);
            paramIndex++;
        }
        
        if (leida !== undefined) {
            query += ` AND leida = $${paramIndex}`;
            params.push(leida === 'true');
            paramIndex++;
        }
        
        query += ` ORDER BY 
            CASE prioridad
                WHEN 'critica' THEN 1
                WHEN 'alta' THEN 2
                WHEN 'normal' THEN 3
                WHEN 'baja' THEN 4
            END,
            fecha_creacion DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        
        params.push(parseInt(limit), parseInt(offset));
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            total: result.rows.length,
            notificaciones: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo notificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo notificaciones',
            error: error.message
        });
    }
});

// ============================================
// GET - Obtener estadísticas
// ============================================
router.get('/stats', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vista_notificaciones_estadisticas');
        
        res.json({
            success: true,
            stats: result.rows[0] || {}
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas',
            error: error.message
        });
    }
});

// ============================================
// POST - Crear notificación
// ============================================
router.post('/', async (req, res) => {
    try {
        const {
            tipo = 'INFO',
            titulo,
            mensaje,
            prioridad = 'normal',
            icono = 'bell',
            accion_url,
            origen,
            metadata
        } = req.body;
        
        if (!titulo || !mensaje) {
            return res.status(400).json({
                success: false,
                message: 'Título y mensaje son requeridos'
            });
        }
        
        const result = await pool.query(`
            INSERT INTO notificaciones_inteligentes (
                tipo,
                titulo,
                mensaje,
                prioridad,
                icono,
                accion_url,
                origen,
                metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [
            tipo,
            titulo,
            mensaje,
            prioridad,
            icono,
            accion_url,
            origen,
            metadata ? JSON.stringify(metadata) : null
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Notificación creada exitosamente',
            notificacion: result.rows[0]
        });
    } catch (error) {
        console.error('Error creando notificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error creando notificación',
            error: error.message
        });
    }
});

// ============================================
// PUT - Marcar como leída
// ============================================
router.put('/:id/leer', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'UPDATE notificaciones_inteligentes SET leida = TRUE WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notificación no encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Notificación marcada como leída',
            notificacion: result.rows[0]
        });
    } catch (error) {
        console.error('Error marcando como leída:', error);
        res.status(500).json({
            success: false,
            message: 'Error marcando como leída',
            error: error.message
        });
    }
});

// ============================================
// POST - Marcar varias como leídas
// ============================================
router.post('/leer-todas', async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un array de IDs'
            });
        }
        
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
        await pool.query(
            `UPDATE notificaciones_inteligentes SET leida = TRUE WHERE id IN (${placeholders})`,
            ids
        );
        
        res.json({
            success: true,
            message: `${ids.length} notificaciones marcadas como leídas`
        });
    } catch (error) {
        console.error('Error marcando como leídas:', error);
        res.status(500).json({
            success: false,
            message: 'Error marcando como leídas',
            error: error.message
        });
    }
});

// ============================================
// PUT - Archivar notificación
// ============================================
router.put('/:id/archivar', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
            UPDATE notificaciones_inteligentes 
            SET archivada = TRUE, 
                fecha_archivado = CURRENT_TIMESTAMP 
            WHERE id = $1
            RETURNING *
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notificación no encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Notificación archivada',
            notificacion: result.rows[0]
        });
    } catch (error) {
        console.error('Error archivando:', error);
        res.status(500).json({
            success: false,
            message: 'Error archivando notificación',
            error: error.message
        });
    }
});

// ============================================
// DELETE - Eliminar notificación
// ============================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM notificaciones_inteligentes WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notificación no encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Notificación eliminada'
        });
    } catch (error) {
        console.error('Error eliminando:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando notificación',
            error: error.message
        });
    }
});

// ============================================
// GET - Notificaciones recientes (últimas 10)
// ============================================
router.get('/recientes/lista', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM notificaciones_inteligentes
            WHERE archivada = FALSE
            ORDER BY 
                CASE WHEN leida = FALSE THEN 0 ELSE 1 END,
                CASE prioridad
                    WHEN 'critica' THEN 1
                    WHEN 'alta' THEN 2
                    WHEN 'normal' THEN 3
                    WHEN 'baja' THEN 4
                END,
                fecha_creacion DESC
            LIMIT 10
        `);
        
        res.json({
            success: true,
            notificaciones: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo recientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo notificaciones recientes',
            error: error.message
        });
    }
});

module.exports = router;
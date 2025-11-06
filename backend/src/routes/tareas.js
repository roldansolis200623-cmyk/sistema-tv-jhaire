// ============================================
// backend/routes/tareas.js
// RUTAS DE TAREAS - COMPLETAS Y SIN ERRORES
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
// GET - Obtener todas las tareas
// ============================================
router.get('/', async (req, res) => {
    try {
        const { 
            estado, 
            prioridad, 
            tipo,
            creado_por,
            limit = 50,
            offset = 0 
        } = req.query;
        
        let query = 'SELECT * FROM tareas WHERE 1=1';
        const params = [];
        let paramIndex = 1;
        
        if (estado) {
            query += ` AND estado = $${paramIndex}`;
            params.push(estado);
            paramIndex++;
        }
        
        if (prioridad) {
            query += ` AND prioridad = $${paramIndex}`;
            params.push(prioridad);
            paramIndex++;
        }
        
        if (tipo) {
            query += ` AND tipo = $${paramIndex}`;
            params.push(tipo);
            paramIndex++;
        }
        
        if (creado_por) {
            query += ` AND creado_por = $${paramIndex}`;
            params.push(creado_por);
            paramIndex++;
        }
        
        query += ` ORDER BY 
            CASE prioridad
                WHEN 'CRÍTICA' THEN 1
                WHEN 'ALTA' THEN 2
                WHEN 'MEDIA' THEN 3
                WHEN 'BAJA' THEN 4
            END,
            fecha_creacion DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        
        params.push(parseInt(limit), parseInt(offset));
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            total: result.rows.length,
            tareas: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo tareas:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo tareas',
            error: error.message
        });
    }
});

// ============================================
// GET - Obtener estadísticas
// ============================================
router.get('/stats', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vista_tareas_estadisticas');
        
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
// GET - Obtener tarea por ID
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'SELECT * FROM tareas WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }
        
        res.json({
            success: true,
            tarea: result.rows[0]
        });
    } catch (error) {
        console.error('Error obteniendo tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo tarea',
            error: error.message
        });
    }
});

// ============================================
// POST - Crear tarea
// ============================================
router.post('/', async (req, res) => {
    try {
        const {
            titulo,
            descripcion,
            tipo = 'manual',
            prioridad = 'MEDIA',
            fecha_vencimiento,
            cliente_id,
            metadata,
            creado_por = 'usuario',
            origen,
            notas
        } = req.body;
        
        if (!titulo) {
            return res.status(400).json({
                success: false,
                message: 'El título es requerido'
            });
        }
        
        const result = await pool.query(`
            INSERT INTO tareas (
                titulo,
                descripcion,
                tipo,
                prioridad,
                fecha_vencimiento,
                cliente_id,
                metadata,
                creado_por,
                origen,
                notas
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [
            titulo,
            descripcion,
            tipo,
            prioridad,
            fecha_vencimiento,
            cliente_id,
            metadata ? JSON.stringify(metadata) : null,
            creado_por,
            origen,
            notas
        ]);
        
        // Registrar en historial
        await pool.query(`
            INSERT INTO tareas_historial (tarea_id, accion, detalles)
            VALUES ($1, 'creada', $2)
        `, [result.rows[0].id, `Tarea creada: ${titulo}`]);
        
        res.status(201).json({
            success: true,
            message: 'Tarea creada exitosamente',
            tarea: result.rows[0]
        });
    } catch (error) {
        console.error('Error creando tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error creando tarea',
            error: error.message
        });
    }
});

// ============================================
// PUT - Actualizar tarea
// ============================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            titulo,
            descripcion,
            tipo,
            prioridad,
            estado,
            fecha_vencimiento,
            notas
        } = req.body;
        
        const result = await pool.query(`
            UPDATE tareas SET
                titulo = COALESCE($1, titulo),
                descripcion = COALESCE($2, descripcion),
                tipo = COALESCE($3, tipo),
                prioridad = COALESCE($4, prioridad),
                estado = COALESCE($5, estado),
                fecha_vencimiento = COALESCE($6, fecha_vencimiento),
                notas = COALESCE($7, notas)
            WHERE id = $8
            RETURNING *
        `, [titulo, descripcion, tipo, prioridad, estado, fecha_vencimiento, notas, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }
        
        // Registrar en historial
        await pool.query(`
            INSERT INTO tareas_historial (tarea_id, accion, detalles)
            VALUES ($1, 'modificada', $2)
        `, [id, 'Tarea actualizada']);
        
        res.json({
            success: true,
            message: 'Tarea actualizada exitosamente',
            tarea: result.rows[0]
        });
    } catch (error) {
        console.error('Error actualizando tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando tarea',
            error: error.message
        });
    }
});

// ============================================
// POST - Completar tarea
// ============================================
router.post('/:id/completar', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
            UPDATE tareas SET
                estado = 'completada',
                fecha_completada = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Tarea completada exitosamente',
            tarea: result.rows[0]
        });
    } catch (error) {
        console.error('Error completando tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error completando tarea',
            error: error.message
        });
    }
});

// ============================================
// DELETE - Eliminar tarea
// ============================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM tareas WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Tarea eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando tarea',
            error: error.message
        });
    }
});

// ============================================
// GET - Obtener tareas urgentes
// ============================================
router.get('/urgentes/lista', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vista_tareas_urgentes LIMIT 10');
        
        res.json({
            success: true,
            tareas: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo tareas urgentes:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo tareas urgentes',
            error: error.message
        });
    }
});

module.exports = router;
// ============================================
// backend/src/controllers/cronController.js
// CONTROLADOR PARA EJECUTAR TAREAS CRON MANUALMENTE
// ============================================

const cronService = require('../services/cronService');
const pool = require('../config/database');

// ============================================
// EJECUTAR TAREA MANUAL
// ============================================

const ejecutarTarea = async (req, res) => {
    try {
        const { tarea } = req.params;
        
        const resultado = await cronService.ejecutarTareaManual(tarea);
        
        if (resultado.success) {
            res.json({
                success: true,
                message: resultado.message,
                tarea
            });
        } else {
            res.status(404).json({
                success: false,
                message: resultado.message
            });
        }
        
    } catch (error) {
        console.error('Error ejecutando tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error ejecutando tarea',
            error: error.message
        });
    }
};

// ============================================
// OBTENER LOGS DE CRON
// ============================================

const getLogs = async (req, res) => {
    try {
        const { tarea, limit = 50 } = req.query;
        
        let query = `
            SELECT * FROM cron_logs
            ${tarea ? 'WHERE tarea = $1' : ''}
            ORDER BY fecha_ejecucion DESC
            LIMIT $${tarea ? 2 : 1}
        `;
        
        const params = tarea ? [tarea, limit] : [limit];
        const result = await pool.query(query, params);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error obteniendo logs:', error);
        res.status(500).json({ error: 'Error obteniendo logs' });
    }
};

// ============================================
// OBTENER ESTADÍSTICAS DE EJECUCIÓN
// ============================================

const getEstadisticas = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                tarea,
                COUNT(*) as total_ejecuciones,
                COUNT(*) FILTER (WHERE estado = 'success') as exitosas,
                COUNT(*) FILTER (WHERE estado = 'error') as fallidas,
                AVG(tiempo_ejecucion) as tiempo_promedio,
                MAX(fecha_ejecucion) as ultima_ejecucion
            FROM cron_logs
            WHERE fecha_ejecucion >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY tarea
            ORDER BY tarea
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
};

// ============================================
// LIMPIAR LOGS ANTIGUOS
// ============================================

const limpiarLogs = async (req, res) => {
    try {
        const { dias = 90 } = req.query;
        
        const result = await pool.query(`
            DELETE FROM cron_logs
            WHERE fecha_ejecucion < CURRENT_DATE - INTERVAL '${dias} days'
        `);
        
        res.json({
            success: true,
            message: `Se eliminaron ${result.rowCount} registros antiguos`
        });
        
    } catch (error) {
        console.error('Error limpiando logs:', error);
        res.status(500).json({ error: 'Error limpiando logs' });
    }
};

// ============================================
// OBTENER CONFIGURACIÓN DEL SISTEMA
// ============================================

const getConfiguracion = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM configuracion_sistema
            ORDER BY categoria, clave
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error obteniendo configuración:', error);
        res.status(500).json({ error: 'Error obteniendo configuración' });
    }
};

// ============================================
// ACTUALIZAR CONFIGURACIÓN
// ============================================

const actualizarConfiguracion = async (req, res) => {
    try {
        const { clave, valor } = req.body;
        
        const result = await pool.query(`
            UPDATE configuracion_sistema
            SET valor = $1, updated_at = CURRENT_TIMESTAMP
            WHERE clave = $2
            RETURNING *
        `, [valor, clave]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Configuración no encontrada' });
        }
        
        res.json({
            success: true,
            config: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error actualizando configuración:', error);
        res.status(500).json({ error: 'Error actualizando configuración' });
    }
};

// ============================================
// EXPORTAR
// ============================================

module.exports = {
    ejecutarTarea,
    getLogs,
    getEstadisticas,
    limpiarLogs,
    getConfiguracion,
    actualizarConfiguracion
};
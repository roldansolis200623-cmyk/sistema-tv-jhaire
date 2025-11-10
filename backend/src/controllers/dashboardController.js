// ============================================
// backend/src/controllers/dashboardController.js
// ✅ MEJORADO: Agregada función getEstadisticas()
// ============================================

const pool = require('../config/database');

const dashboardController = {
    
    /**
     * ✅ NUEVA FUNCIÓN: getEstadisticas
     * Devuelve el TOTAL CORRECTO de clientes (91, no 28)
     */
    getEstadisticas: async (req, res) => {
        try {
            console.log('📊 Obteniendo estadísticas...');
            
            const query = `
                SELECT 
                    COUNT(*) as total_clientes,
                    COUNT(*) FILTER (WHERE estado = 'activo') as clientes_activos,
                    COUNT(*) FILTER (WHERE estado = 'suspendido') as clientes_suspendidos,
                    COUNT(*) FILTER (WHERE meses_deuda > 0) as clientes_con_deuda,
                    COALESCE(SUM(CASE WHEN meses_deuda > 0 THEN deuda_total ELSE 0 END), 0) as deuda_total,
                    ROUND(
                        COUNT(*) FILTER (WHERE meses_deuda > 0) * 100.0 / 
                        NULLIF(COUNT(*), 0), 
                        2
                    ) as tasa_morosidad
                FROM clientes
            `;
            
            const resultado = await pool.query(query);
            const stats = resultado.rows[0];
            
            console.log(`✅ Estadísticas obtenidas:`);
            console.log(`   → Total: ${stats.total_clientes}`);
            console.log(`   → Activos: ${stats.clientes_activos}`);
            console.log(`   → Suspendidos: ${stats.clientes_suspendidos}`);
            console.log(`   → Con deuda: ${stats.clientes_con_deuda}`);
            
            res.json({
                total_clientes: parseInt(stats.total_clientes) || 0,
                clientes_activos: parseInt(stats.clientes_activos) || 0,
                clientes_suspendidos: parseInt(stats.clientes_suspendidos) || 0,
                clientes_con_deuda: parseInt(stats.clientes_con_deuda) || 0,
                deuda_total: parseFloat(stats.deuda_total) || 0,
                tasa_morosidad: parseFloat(stats.tasa_morosidad) || 0
            });
            
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            res.status(500).json({ error: 'Error obteniendo estadísticas' });
        }
    },

    // ============================================
    // RESTO DE FUNCIONES EXISTENTES (sin cambios)
    // ============================================

    getKPIs: async (req, res) => {
        try {
            // Usar vista materializada para performance
            const vista = await pool.query('SELECT * FROM vista_dashboard');
            
            // Ingresos del mes actual
            const ingresosResult = await pool.query(`
                SELECT COALESCE(SUM(monto), 0) as ingresos_mes
                FROM pagos
                WHERE DATE_TRUNC('month', fecha_pago) = DATE_TRUNC('month', CURRENT_DATE)
            `);
            
            // Ingresos del día
            const ingresosDiaResult = await pool.query(`
                SELECT COALESCE(SUM(monto), 0) as ingresos_dia
                FROM pagos
                WHERE fecha_pago = CURRENT_DATE
            `);
            
            res.json({
                clientes_activos: vista.rows[0]?.clientes_activos || 0,
                clientes_suspendidos: vista.rows[0]?.clientes_suspendidos || 0,
                clientes_con_deuda: vista.rows[0]?.clientes_con_deuda || 0,
                deuda_total: parseFloat(vista.rows[0]?.deuda_total || 0),
                deuda_promedio: parseFloat(vista.rows[0]?.deuda_promedio || 0),
                riesgo_alto: vista.rows[0]?.riesgo_alto || 0,
                nuevos_mes: vista.rows[0]?.nuevos_mes || 0,
                ingresos_mes: parseFloat(ingresosResult.rows[0].ingresos_mes),
                ingresos_dia: parseFloat(ingresosDiaResult.rows[0].ingresos_dia)
            });
            
        } catch (error) {
            console.error('Error obteniendo KPIs:', error);
            res.status(500).json({ error: 'Error obteniendo KPIs' });
        }
    },

    getIngresosMensuales: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT 
                    TO_CHAR(fecha_pago, 'Mon') as mes,
                    EXTRACT(MONTH FROM fecha_pago) as mes_num,
                    EXTRACT(YEAR FROM fecha_pago) as anio,
                    COALESCE(SUM(monto), 0) as total
                FROM pagos
                WHERE fecha_pago >= CURRENT_DATE - INTERVAL '12 months'
                GROUP BY 
                    TO_CHAR(fecha_pago, 'Mon'),
                    EXTRACT(MONTH FROM fecha_pago),
                    EXTRACT(YEAR FROM fecha_pago)
                ORDER BY anio, mes_num
            `);
            
            res.json(result.rows);
            
        } catch (error) {
            console.error('Error obteniendo ingresos mensuales:', error);
            res.status(500).json({ error: 'Error obteniendo ingresos mensuales' });
        }
    },

    getTop10MejoresPagadores: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT 
                    c.id,
                    c.nombre || ' ' || c.apellido as cliente,
                    c.dni,
                    c.meses_deuda,
                    COALESCE(c.score_pago, 0) as score_pago,
                    COUNT(p.id) as total_pagos,
                    COALESCE(SUM(p.monto), 0) as monto_total
                FROM clientes c
                LEFT JOIN pagos p ON c.id = p.cliente_id
                WHERE c.estado = 'activo'
                GROUP BY c.id, c.nombre, c.apellido, c.dni, c.meses_deuda, c.score_pago
                ORDER BY monto_total DESC, c.score_pago DESC
                LIMIT 10
            `);
            
            res.json(result.rows);
            
        } catch (error) {
            console.error('Error obteniendo mejores pagadores:', error);
            res.status(500).json({ error: 'Error obteniendo mejores pagadores' });
        }
    },

    getTop10PeoresPagadores: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT 
                    c.id,
                    c.nombre || ' ' || c.apellido as cliente,
                    c.dni,
                    c.meses_deuda,
                    c.deuda_total,
                    c.estado,
                    c.fecha_ultimo_pago
                FROM clientes c
                WHERE c.meses_deuda > 0
                ORDER BY c.deuda_total DESC, c.meses_deuda DESC
                LIMIT 10
            `);
            
            res.json(result.rows);
            
        } catch (error) {
            console.error('Error obteniendo peores pagadores:', error);
            res.status(500).json({ error: 'Error obteniendo peores pagadores' });
        }
    },

    getDistribucionEstado: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT 
                    estado,
                    COUNT(*) as cantidad,
                    ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 2) as porcentaje
                FROM clientes
                GROUP BY estado
            `);
            
            res.json(result.rows);
            
        } catch (error) {
            console.error('Error obteniendo distribución de estado:', error);
            res.status(500).json({ error: 'Error obteniendo distribución de estado' });
        }
    },

    getDistribucionGeografica: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT 
                    zona_geografica,
                    COUNT(*) as cantidad,
                    COUNT(*) FILTER (WHERE estado = 'activo') as activos,
                    COUNT(*) FILTER (WHERE estado = 'suspendido') as suspendidos,
                    ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 2) as porcentaje
                FROM clientes
                WHERE zona_geografica IS NOT NULL
                GROUP BY zona_geografica
                ORDER BY cantidad DESC
            `);
            
            res.json(result.rows);
            
        } catch (error) {
            console.error('Error obteniendo distribución geográfica:', error);
            res.status(500).json({ error: 'Error obteniendo distribución geográfica' });
        }
    },

    getTasaMorosidad: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE meses_deuda > 0) as con_deuda,
                    ROUND(
                        COUNT(*) FILTER (WHERE meses_deuda > 0) * 100.0 / 
                        NULLIF(COUNT(*), 0), 
                        2
                    ) as tasa_morosidad
                FROM clientes
                WHERE estado = 'activo'
            `);
            
            res.json(result.rows[0]);
            
        } catch (error) {
            console.error('Error obteniendo tasa de morosidad:', error);
            res.status(500).json({ error: 'Error obteniendo tasa de morosidad' });
        }
    },

    getNuevosClientesMes: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT 
                    COUNT(*) as nuevos
                FROM clientes
                WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
            `);
            
            res.json({nuevos: result.rows[0].nuevos});
            
        } catch (error) {
            console.error('Error obteniendo nuevos clientes:', error);
            res.status(500).json({ error: 'Error obteniendo nuevos clientes' });
        }
    },

    getProyeccionIngresos: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT 
                    COUNT(*) as clientes_activos,
                    COALESCE(AVG(precio_mensual), 0) as promedio_plan,
                    COALESCE(COUNT(*) * AVG(precio_mensual), 0) as proyeccion_mes
                FROM clientes
                WHERE estado = 'activo'
            `);
            
            res.json(result.rows[0]);
            
        } catch (error) {
            console.error('Error obteniendo proyección:', error);
            res.status(500).json({ error: 'Error obteniendo proyección de ingresos' });
        }
    },

    getClientesRiesgo: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT 
                    c.id,
                    c.nombre || ' ' || c.apellido as cliente,
                    c.telefono,
                    c.email,
                    c.meses_deuda,
                    c.deuda_total,
                    c.estado
                FROM clientes c
                WHERE c.meses_deuda > 5
                ORDER BY c.deuda_total DESC
            `);
            
            res.json(result.rows);
            
        } catch (error) {
            console.error('Error obteniendo clientes en riesgo:', error);
            res.status(500).json({ error: 'Error obteniendo clientes en riesgo' });
        }
    },

    getResumenCompleto: async (req, res) => {
        try {
            const result = await pool.query(`
                WITH stats AS (
                    SELECT 
                        COUNT(*) as total_clientes,
                        COUNT(*) FILTER (WHERE estado = 'activo') as clientes_activos,
                        COUNT(*) FILTER (WHERE meses_deuda > 0) as clientes_con_deuda,
                        COALESCE(SUM(deuda_total), 0) as deuda_total
                    FROM clientes
                )
                SELECT 
                    stats.*,
                    (SELECT COALESCE(SUM(monto), 0) FROM pagos 
                     WHERE DATE_TRUNC('month', fecha_pago) = DATE_TRUNC('month', CURRENT_DATE)) as ingresos_mes
                FROM stats
            `);
            
            res.json(result.rows[0]);
            
        } catch (error) {
            console.error('Error obteniendo resumen completo:', error);
            res.status(500).json({ error: 'Error obteniendo resumen completo' });
        }
    }
};

module.exports = dashboardController;
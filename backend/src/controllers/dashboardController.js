// ============================================
// backend/src/controllers/dashboardController.js
// CONTROLADOR PARA DASHBOARD EJECUTIVO
// ============================================

const pool = require('../config/database');

// ============================================
// OBTENER KPIS PRINCIPALES
// ============================================

const getKPIs = async (req, res) => {
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
            clientes_activos: vista.rows[0].clientes_activos || 0,
            clientes_suspendidos: vista.rows[0].clientes_suspendidos || 0,
            clientes_con_deuda: vista.rows[0].clientes_con_deuda || 0,
            deuda_total: parseFloat(vista.rows[0].deuda_total || 0),
            deuda_promedio: parseFloat(vista.rows[0].deuda_promedio || 0),
            riesgo_alto: vista.rows[0].riesgo_alto || 0,
            nuevos_mes: vista.rows[0].nuevos_mes || 0,
            ingresos_mes: parseFloat(ingresosResult.rows[0].ingresos_mes),
            ingresos_dia: parseFloat(ingresosDiaResult.rows[0].ingresos_dia)
        });
        
    } catch (error) {
        console.error('Error obteniendo KPIs:', error);
        res.status(500).json({ error: 'Error obteniendo KPIs' });
    }
};

// ============================================
// INGRESOS MENSUALES (Últimos 12 meses)
// ============================================

const getIngresosMensuales = async (req, res) => {
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
};

// ============================================
// TOP 10 MEJORES PAGADORES
// ============================================

const getTop10MejoresPagadores = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.id,
                c.nombre || ' ' || c.apellido as cliente,
                c.dni,
                c.meses_deuda,
                c.score_pago,
                COUNT(p.id) as total_pagos,
                COALESCE(SUM(p.monto), 0) as monto_total
            FROM clientes c
            LEFT JOIN pagos p ON c.id = p.cliente_id
            WHERE c.estado = 'activo'
            GROUP BY c.id, c.nombre, c.apellido, c.dni, c.meses_deuda, c.score_pago
            ORDER BY monto_total DESC, score_pago DESC
            LIMIT 10
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error obteniendo mejores pagadores:', error);
        res.status(500).json({ error: 'Error obteniendo mejores pagadores' });
    }
};

// ============================================
// TOP 10 PEORES PAGADORES
// ============================================

const getTop10PeoresPagadores = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.id,
                c.nombre || ' ' || c.apellido as cliente,
                c.dni,
                c.telefono,
                c.meses_deuda,
                c.precio_mensual,
                (c.meses_deuda * c.precio_mensual) as deuda_total,
                c.score_pago,
                c.zona_geografica
            FROM clientes c
            WHERE c.estado = 'activo' AND c.meses_deuda > 0
            ORDER BY c.meses_deuda DESC, deuda_total DESC
            LIMIT 10
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error obteniendo peores pagadores:', error);
        res.status(500).json({ error: 'Error obteniendo peores pagadores' });
    }
};

// ============================================
// DISTRIBUCIÓN POR ESTADO
// ============================================

const getDistribucionEstado = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                estado,
                COUNT(*) as cantidad,
                ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 2) as porcentaje
            FROM clientes
            GROUP BY estado
            ORDER BY cantidad DESC
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error obteniendo distribución:', error);
        res.status(500).json({ error: 'Error obteniendo distribución' });
    }
};

// ============================================
// DISTRIBUCIÓN GEOGRÁFICA
// ============================================

const getDistribucionGeografica = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                COALESCE(zona_geografica, 'Sin zona') as zona,
                COUNT(*) as total_clientes,
                COUNT(*) FILTER (WHERE estado = 'activo') as activos,
                COUNT(*) FILTER (WHERE meses_deuda > 0) as con_deuda,
                COALESCE(SUM(meses_deuda * precio_mensual), 0) as deuda_total,
                COALESCE(SUM(precio_mensual), 0) as facturacion_potencial
            FROM clientes
            GROUP BY zona_geografica
            ORDER BY total_clientes DESC
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error obteniendo distribución geográfica:', error);
        res.status(500).json({ error: 'Error obteniendo distribución geográfica' });
    }
};

// ============================================
// TASA DE MOROSIDAD HISTÓRICA (6 meses)
// ============================================

const getTasaMorosidad = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                fecha,
                tasa_morosidad,
                clientes_con_deuda,
                clientes_activos
            FROM metricas_historicas
            WHERE fecha >= CURRENT_DATE - INTERVAL '6 months'
            ORDER BY fecha ASC
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error obteniendo tasa morosidad:', error);
        res.status(500).json({ error: 'Error obteniendo tasa morosidad' });
    }
};

// ============================================
// PROYECCIÓN DE INGRESOS
// ============================================

const getProyeccionIngresos = async (req, res) => {
    try {
        // Calcular proyección basada en:
        // 1. Clientes activos sin deuda que pagarán este mes
        // 2. Clientes con deuda que podrían pagar (basado en histórico)
        
        const result = await pool.query(`
            WITH ingresos_confirmados AS (
                SELECT COALESCE(SUM(monto), 0) as total
                FROM pagos
                WHERE DATE_TRUNC('month', fecha_pago) = DATE_TRUNC('month', CURRENT_DATE)
            ),
            ingresos_potenciales AS (
                SELECT COALESCE(SUM(precio_mensual), 0) as total
                FROM clientes
                WHERE estado = 'activo' AND meses_deuda = 0
            ),
            recuperacion_estimada AS (
                SELECT COALESCE(SUM(precio_mensual * 0.3), 0) as total
                FROM clientes
                WHERE estado = 'activo' 
                AND meses_deuda > 0 
                AND meses_deuda <= 2
            )
            SELECT 
                ic.total as ingresado,
                ip.total as por_ingresar,
                re.total as recuperacion_estimada,
                (ic.total + ip.total + re.total) as proyeccion_total
            FROM ingresos_confirmados ic, ingresos_potenciales ip, recuperacion_estimada re
        `);
        
        res.json(result.rows[0]);
        
    } catch (error) {
        console.error('Error obteniendo proyección:', error);
        res.status(500).json({ error: 'Error obteniendo proyección' });
    }
};

// ============================================
// NUEVOS CLIENTES POR MES (12 meses)
// ============================================

const getNuevosClientesMes = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                TO_CHAR(fecha_instalacion, 'Mon YYYY') as mes,
                COUNT(*) as nuevos
            FROM clientes
            WHERE fecha_instalacion >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY TO_CHAR(fecha_instalacion, 'Mon YYYY'), 
                     DATE_TRUNC('month', fecha_instalacion)
            ORDER BY DATE_TRUNC('month', fecha_instalacion) ASC
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error obteniendo nuevos clientes:', error);
        res.status(500).json({ error: 'Error obteniendo nuevos clientes' });
    }
};

// ============================================
// CLIENTES EN RIESGO (Score bajo + Deuda)
// ============================================

const getClientesRiesgo = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.id,
                c.nombre || ' ' || c.apellido as cliente,
                c.dni,
                c.telefono,
                c.meses_deuda,
                c.score_pago,
                c.precio_mensual,
                (c.meses_deuda * c.precio_mensual) as deuda_total,
                c.zona_geografica,
                c.fecha_ultimo_pago,
                CASE 
                    WHEN c.meses_deuda >= 3 THEN 'CRÍTICO'
                    WHEN c.meses_deuda >= 2 THEN 'ALTO'
                    WHEN c.score_pago < 30 THEN 'MEDIO'
                    ELSE 'BAJO'
                END as nivel_riesgo
            FROM clientes c
            WHERE c.estado = 'activo'
            AND (c.meses_deuda >= 2 OR c.score_pago < 40)
            ORDER BY c.meses_deuda DESC, c.score_pago ASC
            LIMIT 20
        `);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error obteniendo clientes en riesgo:', error);
        res.status(500).json({ error: 'Error obteniendo clientes en riesgo' });
    }
};

// ============================================
// RESUMEN COMPLETO DEL DASHBOARD
// ============================================

const getResumenCompleto = async (req, res) => {
    try {
        const [
            kpis,
            ingresos,
            mejores,
            peores,
            distribucion,
            geografia,
            morosidad,
            proyeccion,
            nuevos,
            riesgo
        ] = await Promise.all([
            pool.query('SELECT * FROM vista_dashboard'),
            pool.query(`
                SELECT COALESCE(SUM(monto), 0) as ingresos_mes
                FROM pagos
                WHERE DATE_TRUNC('month', fecha_pago) = DATE_TRUNC('month', CURRENT_DATE)
            `),
            pool.query(`
                SELECT c.nombre || ' ' || c.apellido as cliente, COALESCE(SUM(p.monto), 0) as total
                FROM clientes c LEFT JOIN pagos p ON c.id = p.cliente_id
                WHERE c.estado = 'activo'
                GROUP BY c.id, c.nombre, c.apellido
                ORDER BY total DESC LIMIT 5
            `),
            pool.query(`
                SELECT c.nombre || ' ' || c.apellido as cliente, c.meses_deuda,
                       (c.meses_deuda * c.precio_mensual) as deuda_total
                FROM clientes c
                WHERE c.estado = 'activo' AND c.meses_deuda > 0
                ORDER BY c.meses_deuda DESC LIMIT 5
            `),
            pool.query(`
                SELECT estado, COUNT(*) as cantidad
                FROM clientes GROUP BY estado
            `),
            pool.query(`
                SELECT COALESCE(zona_geografica, 'Sin zona') as zona, COUNT(*) as clientes
                FROM clientes GROUP BY zona_geografica
            `),
            pool.query(`
                SELECT fecha, tasa_morosidad FROM metricas_historicas
                WHERE fecha >= CURRENT_DATE - INTERVAL '6 months'
                ORDER BY fecha
            `),
            pool.query(`
                SELECT COALESCE(SUM(precio_mensual), 0) as proyeccion
                FROM clientes WHERE estado = 'activo'
            `),
            pool.query(`
                SELECT COUNT(*) as total FROM clientes
                WHERE DATE_TRUNC('month', fecha_instalacion) = DATE_TRUNC('month', CURRENT_DATE)
            `),
            pool.query(`
                SELECT COUNT(*) as total FROM clientes
                WHERE estado = 'activo' AND (meses_deuda >= 2 OR score_pago < 40)
            `)
        ]);
        
        res.json({
            kpis: {
                ...kpis.rows[0],
                ingresos_mes: parseFloat(ingresos.rows[0].ingresos_mes)
            },
            mejores_pagadores: mejores.rows,
            peores_pagadores: peores.rows,
            distribucion_estado: distribucion.rows,
            distribucion_geografica: geografia.rows,
            tasa_morosidad: morosidad.rows,
            proyeccion_ingresos: parseFloat(proyeccion.rows[0].proyeccion),
            nuevos_este_mes: parseInt(nuevos.rows[0].total),
            clientes_riesgo: parseInt(riesgo.rows[0].total)
        });
        
    } catch (error) {
        console.error('Error obteniendo resumen completo:', error);
        res.status(500).json({ error: 'Error obteniendo resumen completo' });
    }
};

// ============================================
// EXPORTAR
// ============================================

module.exports = {
    getKPIs,
    getIngresosMensuales,
    getTop10MejoresPagadores,
    getTop10PeoresPagadores,
    getDistribucionEstado,
    getDistribucionGeografica,
    getTasaMorosidad,
    getProyeccionIngresos,
    getNuevosClientesMes,
    getClientesRiesgo,
    getResumenCompleto
};
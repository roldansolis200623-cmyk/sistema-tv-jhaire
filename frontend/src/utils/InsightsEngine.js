// ============================================
// frontend/src/utils/InsightsEngine.js
// MOTOR DE INTELIGENCIA ARTIFICIAL PARA INSIGHTS
// ============================================

/**
 * 🤖 GENERA INSIGHTS INTELIGENTES
 * Analiza los datos y genera recomendaciones automáticas
 */
export const generateInsights = (data) => {
    const { kpis, ingresos, morosidad, proyeccion, riesgo } = data;
    
    const insights = [];
    const alerts = [];
    const recommendations = [];

    // ============================================
    // ANÁLISIS DE INGRESOS
    // ============================================
    if (ingresos && ingresos.length >= 2) {
        const ultimos2Meses = ingresos.slice(-2);
        const mesActual = parseFloat(ultimos2Meses[1]?.total || 0);
        const mesAnterior = parseFloat(ultimos2Meses[0]?.total || 0);
        const variacion = ((mesActual - mesAnterior) / mesAnterior) * 100;

        if (variacion > 10) {
            insights.push({
                type: 'success',
                title: '📈 Crecimiento Excepcional',
                message: `Los ingresos aumentaron un ${variacion.toFixed(1)}% respecto al mes anterior. ¡Excelente trabajo!`,
                action: 'Ver detalles'
            });
        } else if (variacion < -5) {
            alerts.push({
                type: 'warning',
                message: `Los ingresos cayeron ${Math.abs(variacion).toFixed(1)}%. Requiere atención inmediata.`,
                action: 'Analizar causas'
            });
            
            recommendations.push({
                priority: 'ALTA',
                title: 'Recuperar Ingresos',
                description: 'Implementar campaña de reactivación de clientes suspendidos y recuperación de deuda.',
                impact: 'Alto'
            });
        }
    }

    // ============================================
    // ANÁLISIS DE MOROSIDAD
    // ============================================
    if (morosidad && morosidad.length > 0) {
        const tasaActual = parseFloat(morosidad[morosidad.length - 1]?.tasa_morosidad || 0);
        
        if (tasaActual > 30) {
            alerts.push({
                type: 'critical',
                message: `Tasa de morosidad crítica: ${tasaActual.toFixed(1)}%. Acción urgente requerida.`,
                action: 'Plan de cobranza'
            });

            recommendations.push({
                priority: 'CRÍTICA',
                title: 'Plan de Cobranza Intensivo',
                description: 'Implementar seguimiento diario a clientes con más de 2 meses de deuda.',
                impact: 'Muy Alto'
            });
        } else if (tasaActual < 15) {
            insights.push({
                type: 'success',
                title: '✅ Morosidad Controlada',
                message: `Excelente gestión de cobranza. Tasa del ${tasaActual.toFixed(1)}%.`,
                action: 'Mantener estrategia'
            });
        }
    }

    // ============================================
    // ANÁLISIS DE PROYECCIÓN
    // ============================================
    if (proyeccion) {
        const porcentajeCompletado = (proyeccion.ingresado / proyeccion.proyeccion_total) * 100;
        const diasTranscurridos = new Date().getDate();
        const diasMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const porcentajeEsperado = (diasTranscurridos / diasMes) * 100;

        if (porcentajeCompletado < porcentajeEsperado - 10) {
            insights.push({
                type: 'warning',
                title: '⚠️ Proyección Atrasada',
                message: `Llevas ${porcentajeCompletado.toFixed(1)}% pero deberías estar en ${porcentajeEsperado.toFixed(1)}%.`,
                action: 'Acelerar cobranza'
            });

            recommendations.push({
                priority: 'MEDIA',
                title: 'Acelerar Cobranza',
                description: 'Enviar recordatorios masivos y priorizar clientes con vencimientos próximos.',
                impact: 'Alto'
            });
        } else if (porcentajeCompletado > porcentajeEsperado + 5) {
            insights.push({
                type: 'success',
                title: '🎯 Superando Objetivos',
                message: `¡Vas ${(porcentajeCompletado - porcentajeEsperado).toFixed(1)}% por encima de lo proyectado!`,
                action: 'Ver oportunidades'
            });
        }
    }

    // ============================================
    // ANÁLISIS DE CLIENTES EN RIESGO
    // ============================================
    if (riesgo && riesgo.length > 0) {
        const riesgoCritico = riesgo.filter(c => c.nivel_riesgo === 'CRÍTICO' || c.nivel_riesgo === 'Crítico').length;
        const riesgoAlto = riesgo.filter(c => c.nivel_riesgo === 'ALTO' || c.nivel_riesgo === 'Alto').length;

        if (riesgoCritico > 0) {
            alerts.push({
                type: 'critical',
                message: `${riesgoCritico} clientes en riesgo crítico de pérdida.`,
                action: 'Contactar ahora'
            });

            recommendations.push({
                priority: 'CRÍTICA',
                title: 'Retención de Clientes',
                description: `Contactar inmediatamente a los ${riesgoCritico} clientes en riesgo crítico antes de perderlos.`,
                impact: 'Muy Alto'
            });
        }

        if (riesgoAlto > 3) {
            insights.push({
                type: 'warning',
                title: '🚨 Múltiples Clientes en Riesgo',
                message: `${riesgoAlto} clientes en riesgo alto. Requieren seguimiento.`,
                action: 'Ver lista'
            });
        }
    }

    // ============================================
    // ANÁLISIS DE KPIs
    // ============================================
    if (kpis) {
        const ratioActivos = (kpis.clientes_activos / (kpis.clientes_activos + kpis.clientes_suspendidos)) * 100;
        
        if (ratioActivos > 85) {
            insights.push({
                type: 'success',
                title: '💪 Alta Retención',
                message: `${ratioActivos.toFixed(1)}% de clientes activos. Excelente fidelización.`,
                action: 'Analizar factores'
            });
        } else if (ratioActivos < 70) {
            insights.push({
                type: 'warning',
                title: '📉 Baja Retención',
                message: `Solo ${ratioActivos.toFixed(1)}% de clientes activos. Mejorar servicio.`,
                action: 'Plan de mejora'
            });

            recommendations.push({
                priority: 'ALTA',
                title: 'Mejorar Retención',
                description: 'Encuesta de satisfacción y plan de reactivación de suspendidos.',
                impact: 'Alto'
            });
        }
    }

    // ============================================
    // RECOMENDACIONES GENERALES
    // ============================================
    recommendations.push({
        priority: 'MEDIA',
        title: 'Optimizar Rutas de Cobranza',
        description: 'Agrupar clientes por zona geográfica para reducir tiempo de visitas.',
        impact: 'Medio'
    });

    recommendations.push({
        priority: 'BAJA',
        title: 'Automatizar Recordatorios',
        description: 'Configurar mensajes automáticos 3 días antes del vencimiento.',
        impact: 'Medio'
    });

    return {
        insights,
        alerts,
        recommendations
    };
};

/**
 * 🔮 PREDICE TENDENCIAS FUTURAS
 */
export const predictTrends = (ingresos, morosidad) => {
    if (!ingresos || ingresos.length < 3) {
        return {};
    }

    // Análisis simple de tendencia lineal
    const ultimos3Meses = ingresos.slice(-3).map(d => parseFloat(d.total));
    const promedio = ultimos3Meses.reduce((a, b) => a + b, 0) / ultimos3Meses.length;
    const tendencia = (ultimos3Meses[2] - ultimos3Meses[0]) / 2;
    const prediccionProximoMes = ultimos3Meses[2] + tendencia;

    // Calcular confianza basada en consistencia
    const desviacion = Math.sqrt(
        ultimos3Meses.map(x => Math.pow(x - promedio, 2)).reduce((a, b) => a + b, 0) / 3
    );
    const confianza = Math.max(50, 100 - (desviacion / promedio * 100));

    return {
        nextMonth: {
            expected: prediccionProximoMes,
            min: prediccionProximoMes * 0.9,
            max: prediccionProximoMes * 1.1,
            confidence: confianza
        },
        trend: tendencia > 0 ? 'up' : tendencia < 0 ? 'down' : 'stable'
    };
};

/**
 * 🎯 ANALIZA RIESGOS
 */
export const analyzeRisks = (clientes) => {
    const riesgos = {
        critico: [],
        alto: [],
        medio: [],
        bajo: []
    };

    clientes.forEach(cliente => {
        const score = cliente.score_pago || 0;
        const deuda = cliente.deuda_total || 0;
        const mesesDeuda = cliente.meses_deuda || 0;

        let nivel = 'bajo';
        if (score < 30 || mesesDeuda > 3 || deuda > 300) {
            nivel = 'critico';
        } else if (score < 50 || mesesDeuda > 2 || deuda > 200) {
            nivel = 'alto';
        } else if (score < 70 || mesesDeuda > 1 || deuda > 100) {
            nivel = 'medio';
        }

        riesgos[nivel].push(cliente);
    });

    return riesgos;
};

/**
 * 📊 GENERA MÉTRICAS COMPARATIVAS
 */
export const generateComparatives = (current, previous) => {
    const comparatives = {};

    Object.keys(current).forEach(key => {
        if (typeof current[key] === 'number' && typeof previous[key] === 'number') {
            const diff = current[key] - previous[key];
            const percent = previous[key] !== 0 ? (diff / previous[key]) * 100 : 0;

            comparatives[key] = {
                current: current[key],
                previous: previous[key],
                difference: diff,
                percentChange: percent,
                trend: diff >= 0 ? 'up' : 'down'
            };
        }
    });

    return comparatives;
};
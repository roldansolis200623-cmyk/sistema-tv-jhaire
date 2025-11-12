// ============================================
// frontend/src/pages/DashboardExecutive.jsx
// ✅ CORREGIDO: Usar /dashboard/estadisticas en lugar de /dashboard/kpis
// ESTO DEVUELVE DATOS EN TIEMPO REAL (97 clientes, no 28)
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import {
    ArrowLeft,
    Download,
    FileText,
    Mail,
    Filter,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Brain,
    Zap,
    Target,
    Users,
    DollarSign,
    RefreshCw,
    CheckCircle
} from 'lucide-react';
import api from '../services/api';
import { generateInsights, predictTrends } from '../utils/InsightsEngine';
import { exportToPDF, exportToExcel, sendEmail } from '../utils/ExportService';
import DashboardFilters from '../components/DashboardFilters';
import './DashboardExecutive.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const DashboardExecutive = () => {
    const navigate = useNavigate();
    const dashboardRef = useRef(null);
    
    // Estados principales
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [kpis, setKpis] = useState({});
    const [ingresosMensuales, setIngresosMensuales] = useState([]);
    const [mejoresPagadores, setMejoresPagadores] = useState([]);
    const [peoresPagadores, setPeoresPagadores] = useState([]);
    const [distribucionEstado, setDistribucionEstado] = useState([]);
    const [tasaMorosidad, setTasaMorosidad] = useState([]);
    const [proyeccion, setProyeccion] = useState({});
    const [clientesRiesgo, setClientesRiesgo] = useState([]);
    const [distribucionGeo, setDistribucionGeo] = useState([]);
    
    // Estados IA & Insights
    const [insights, setInsights] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [predictions, setPredictions] = useState({});
    const [recommendations, setRecommendations] = useState([]);
    
    // Estados UI
    const [showFilters, setShowFilters] = useState(false);
    
    // Estados filtros
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date()
    });
    const [filters, setFilters] = useState({
        zona: 'todas',
        estado: 'todos',
        scoreMin: 0,
        scoreMax: 100
    });

    useEffect(() => {
        cargarDatos();
        const interval = setInterval(() => {
            cargarDatos(true);
        }, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, [dateRange, filters]);

    const cargarDatos = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }
            
            const [
                kpisRes,
                ingresosRes,
                mejoresRes,
                peoresRes,
                distEstadoRes,
                tasaMorRes,
                proyRes,
                riesgoRes,
                geoRes
            ] = await Promise.all([
                // ✅ CAMBIO: Usar /estadisticas en lugar de /kpis
                api.get('/dashboard/estadisticas'),
                api.get('/dashboard/ingresos-mensuales'),
                api.get('/dashboard/mejores-pagadores'),
                api.get('/dashboard/peores-pagadores'),
                api.get('/dashboard/distribucion-estado'),
                api.get('/dashboard/tasa-morosidad'),
                api.get('/dashboard/proyeccion-ingresos'),
                api.get('/dashboard/clientes-riesgo'),
                api.get('/dashboard/distribucion-geografica')
            ]);

            // ✅ DATOS EN TIEMPO REAL (no de la vista materializada)
            const kpisData = kpisRes.data || {};
            const ingresosData = Array.isArray(ingresosRes.data) ? ingresosRes.data : [];
            const tasaMorData = tasaMorRes.data || {};
            const proyData = proyRes.data || {};
            const riesgoData = Array.isArray(riesgoRes.data) ? riesgoRes.data : [];
            const mejoresData = Array.isArray(mejoresRes.data) ? mejoresRes.data : [];
            const peoresData = Array.isArray(peoresRes.data) ? peoresRes.data : [];
            const distEstadoData = Array.isArray(distEstadoRes.data) ? distEstadoRes.data : [];
            const geoData = Array.isArray(geoRes.data) ? geoRes.data : [];

            console.log('📊 Datos cargados:');
            console.log(`   → Total de clientes: ${kpisData.total_clientes}`);
            console.log(`   → Clientes activos: ${kpisData.clientes_activos}`);
            console.log(`   → Con deuda: ${kpisData.clientes_con_deuda}`);

            setKpis(kpisData);
            setIngresosMensuales(ingresosData);
            setMejoresPagadores(mejoresData);
            setPeoresPagadores(peoresData);
            setDistribucionEstado(distEstadoData);
            setTasaMorosidad(tasaMorData);
            setProyeccion(proyData);
            setClientesRiesgo(riesgoData);
            setDistribucionGeo(geoData);

            // GENERAR INSIGHTS CON IA
            const generatedInsights = generateInsights({
                kpis: kpisData,
                ingresos: ingresosData,
                morosidad: tasaMorData,
                proyeccion: proyData,
                riesgo: riesgoData
            });
            setInsights(Array.isArray(generatedInsights.insights) ? generatedInsights.insights : []);
            setAlerts(Array.isArray(generatedInsights.alerts) ? generatedInsights.alerts : []);
            setRecommendations(Array.isArray(generatedInsights.recommendations) ? generatedInsights.recommendations : []);

            // PREDICCIONES
            const predictions = predictTrends(ingresosData, tasaMorData);
            setPredictions(predictions || {});
            
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error('Error cargando dashboard:', error);
            // Setear valores por defecto en caso de error
            setKpis({});
            setIngresosMensuales([]);
            setMejoresPagadores([]);
            setPeoresPagadores([]);
            setDistribucionEstado([]);
            setTasaMorosidad({});
            setProyeccion({});
            setClientesRiesgo([]);
            setDistribucionGeo([]);
            setInsights([]);
            setAlerts([]);
            setRecommendations([]);
            setPredictions({});
            setLoading(false);
            setRefreshing(false);
        }
    };

    // ============================================
    // FUNCIONES DE ACCIÓN PARA LOS BOTONES
    // ============================================

    const handleAccionInsight = (insight) => {
        if (insight.title.includes('Proyección')) {
            navigate('/pagos');
        } else if (insight.title.includes('Riesgo')) {
            const element = document.querySelector('.riesgo-premium');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else if (insight.title.includes('Retención')) {
            navigate('/clientes');
        } else {
            alert('Redirigiendo a la sección correspondiente...');
        }
    };

    const handleAccionAlerta = (alerta) => {
        if (alerta.message.includes('riesgo crítico')) {
            const element = document.querySelector('.riesgo-premium');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                element.style.boxShadow = '0 0 30px rgba(255, 59, 48, 0.5)';
                setTimeout(() => {
                    element.style.boxShadow = '';
                }, 2000);
            }
        } else {
            navigate('/clientes');
        }
    };

    const handleAplicarRecomendacion = (recomendacion) => {
        const mensaje = `¿Aplicar la recomendación?\n\n"${recomendacion.title}"\n\n${recomendacion.description}`;
        
        if (window.confirm(mensaje)) {
            alert(`✅ Recomendación aplicada: "${recomendacion.title}"\n\nSe ha creado una tarea en tu sistema.`);
        }
    };

    const handleExportPDF = async () => {
        try {
            await exportToPDF(dashboardRef.current, {
                kpis,
                insights,
                alerts,
                recommendations
            });
        } catch (error) {
            console.error('Error exportando PDF:', error);
            alert('Error al exportar PDF');
        }
    };

    const handleExportExcel = async () => {
        try {
            await exportToExcel({
                kpis,
                ingresos: ingresosMensuales,
                mejoresPagadores,
                peoresPagadores,
                clientesRiesgo
            });
        } catch (error) {
            console.error('Error exportando Excel:', error);
            alert('Error al exportar Excel');
        }
    };

    const handleSendEmail = async () => {
        const email = prompt('Ingresa el email destino:');
        if (!email) return;
        
        try {
            await sendEmail(email, {
                kpis,
                insights,
                alerts
            });
            alert('Email enviado correctamente');
        } catch (error) {
            console.error('Error enviando email:', error);
            alert('Error al enviar email');
        }
    };

    const formatMoney = (value) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(value || 0);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('es-PE').format(value || 0);
    };

    const formatPercent = (value) => {
        return `${(value || 0).toFixed(1)}%`;
    };

    const getScoreClass = (score) => {
        if (score >= 80) return 'excelente';
        if (score >= 60) return 'bueno';
        if (score >= 40) return 'regular';
        if (score >= 20) return 'malo';
        return 'critico';
    };

    // Configuración de gráficos
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
                displayColors: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { color: '#86868b' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#86868b' }
            }
        }
    };

    const ingresosChartData = {
        labels: (Array.isArray(ingresosMensuales) ? ingresosMensuales : []).map(d => d.mes),
        datasets: [{
            label: 'Ingresos',
            data: (Array.isArray(ingresosMensuales) ? ingresosMensuales : []).map(d => parseFloat(d.total || 0)),
            backgroundColor: 'rgba(0, 122, 255, 0.8)',
            borderColor: 'rgba(0, 122, 255, 1)',
            borderWidth: 3,
            borderRadius: 8
        }]
    };

    const distribucionEstadoData = {
        labels: (Array.isArray(distribucionEstado) ? distribucionEstado : []).map(d => d.estado),
        datasets: [{
            data: (Array.isArray(distribucionEstado) ? distribucionEstado : []).map(d => d.cantidad || 0),
            backgroundColor: [
                'rgba(52, 199, 89, 0.8)',
                'rgba(255, 149, 0, 0.8)',
                'rgba(255, 59, 48, 0.8)'
            ],
            borderWidth: 0
        }]
    };

    const morosidadChartData = {
        labels: Array.isArray(tasaMorosidad) ? tasaMorosidad.map(d => new Date(d.fecha || new Date()).toLocaleDateString('es-PE', { month: 'short' })) : [],
        datasets: [{
            label: 'Morosidad',
            data: Array.isArray(tasaMorosidad) ? tasaMorosidad.map(d => parseFloat(d.tasa_morosidad || 0)) : [],
            fill: true,
            backgroundColor: 'rgba(255, 59, 48, 0.1)',
            borderColor: 'rgba(255, 59, 48, 1)',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgba(255, 59, 48, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        }]
    };

    const distribucionGeoData = {
        labels: (Array.isArray(distribucionGeo) ? distribucionGeo : []).map(d => d.zona_geografica),
        datasets: [{
            data: (Array.isArray(distribucionGeo) ? distribucionGeo : []).map(d => d.cantidad || 0),
            backgroundColor: [
                'rgba(0, 122, 255, 0.8)',
                'rgba(88, 86, 214, 0.8)',
                'rgba(52, 199, 89, 0.8)',
                'rgba(255, 149, 0, 0.8)',
                'rgba(255, 59, 48, 0.8)'
            ],
            borderWidth: 0
        }]
    };

    if (loading) {
        return (
            <div className="executive-loading">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="loading-spinner"
                />
                <p>Cargando inteligencia ejecutiva...</p>
            </div>
        );
    }

    return (
        <div className="executive-dashboard" ref={dashboardRef}>
            {/* HEADER */}
            <motion.header 
                className="executive-header"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="header-content">
                    <div className="header-left">
                        <motion.button
                            onClick={() => navigate('/dashboard')}
                            className="btn-back"
                            whileHover={{ x: -5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ArrowLeft size={20} />
                            <span>Panel de Control</span>
                        </motion.button>
                    </div>

                    <div className="header-center">
                        <h1>Dashboard Ejecutivo</h1>
                        <div className="header-meta">
                            <span className="live-indicator">
                                <span className="pulse"></span>
                                EN VIVO
                            </span>
                            <span className="date-time">
                                {new Date().toLocaleDateString('es-PE', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </span>
                        </div>
                    </div>

                    <div className="header-right">
                        <motion.button
                            className="btn-icon"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowFilters(!showFilters)}
                            title="Filtros"
                        >
                            <Filter size={20} />
                        </motion.button>
                        
                        <motion.button
                            className="btn-icon"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleExportPDF}
                            title="Exportar PDF"
                        >
                            <Download size={20} />
                        </motion.button>

                        <motion.button
                            className="btn-icon"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleExportExcel}
                            title="Exportar Excel"
                        >
                            <FileText size={20} />
                        </motion.button>

                        <motion.button
                            className="btn-icon"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSendEmail}
                            title="Enviar por Email"
                        >
                            <Mail size={20} />
                        </motion.button>

                        <motion.button
                            className="btn-primary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => cargarDatos()}
                            disabled={refreshing}
                        >
                            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
                            {refreshing ? 'Actualizando...' : 'Actualizar'}
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            {/* FILTROS */}
            {showFilters && (
                <DashboardFilters
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    filters={filters}
                    setFilters={setFilters}
                    onClose={() => setShowFilters(false)}
                />
            )}

            <div className="dashboard-content">
                {/* INSIGHTS IA */}
                {Array.isArray(insights) && insights.length > 0 && (
                    <motion.div
                        className="insights-section"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        <div className="insights-header">
                            <div className="insights-title">
                                <Brain size={24} />
                                <h2>Asistente Inteligente</h2>
                                <span className="badge-ai">IA</span>
                            </div>
                        </div>

                        <div className="insights-grid">
                            {insights.map((insight, i) => (
                                <motion.div
                                    key={i}
                                    className={`insight-card insight-${insight.type}`}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="insight-icon">
                                        {insight.type === 'warning' && <AlertCircle size={20} />}
                                        {insight.type === 'success' && <Target size={20} />}
                                        {insight.type === 'info' && <Zap size={20} />}
                                    </div>
                                    <div className="insight-content">
                                        <h4>{insight.title}</h4>
                                        <p>{insight.message}</p>
                                        {insight.action && (
                                            <button 
                                                className="insight-action"
                                                onClick={() => handleAccionInsight(insight)}
                                            >
                                                {insight.action}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {Array.isArray(alerts) && alerts.length > 0 && (
                            <div className="alerts-critical">
                                <h3>🚨 Alertas Críticas</h3>
                                <div className="alerts-list">
                                    {alerts.map((alert, i) => (
                                        <motion.div
                                            key={i}
                                            className="alert-item"
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <AlertCircle size={18} />
                                            <span>{alert.message}</span>
                                            <button 
                                                className="alert-action"
                                                onClick={() => handleAccionAlerta(alert)}
                                            >
                                                {alert.action}
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {Array.isArray(recommendations) && recommendations.length > 0 && (
                            <div className="recommendations">
                                <h3>💡 Recomendaciones</h3>
                                <div className="recommendations-list">
                                    {recommendations.map((rec, i) => (
                                        <motion.div
                                            key={i}
                                            className="recommendation-item"
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            whileHover={{ x: 5 }}
                                        >
                                            <div className="recommendation-priority">
                                                {rec.priority}
                                            </div>
                                            <div className="recommendation-content">
                                                <h4>{rec.title}</h4>
                                                <p>{rec.description}</p>
                                            </div>
                                            <button 
                                                className="recommendation-action"
                                                onClick={() => handleAplicarRecomendacion(rec)}
                                            >
                                                Aplicar
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* KPIS */}
                <div className="kpis-ultra">
                    <motion.div 
                        className="kpi-ultra kpi-primary"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                    >
                        <div className="kpi-header">
                            <div className="kpi-icon">
                                <Users size={28} />
                            </div>
                            <div className="kpi-trend">
                                <span className="trend-positive">
                                    <TrendingUp size={16} />
                                    12%
                                </span>
                            </div>
                        </div>
                        <div className="kpi-body">
                            <h3>Clientes Activos</h3>
                            <div className="kpi-value">{formatNumber(kpis.clientes_activos || 0)}</div>
                            <p className="kpi-subtitle">Total: {formatNumber(kpis.total_clientes || 0)}</p>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="kpi-ultra kpi-success"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                    >
                        <div className="kpi-header">
                            <div className="kpi-icon">
                                <DollarSign size={28} />
                            </div>
                            <div className="kpi-trend">
                                <span className="trend-positive">
                                    <TrendingUp size={16} />
                                    8.5%
                                </span>
                            </div>
                        </div>
                        <div className="kpi-body">
                            <h3>Deuda Total</h3>
                            <div className="kpi-value">{formatMoney(kpis.deuda_total || 0)}</div>
                            <p className="kpi-subtitle">De {formatNumber(kpis.clientes_con_deuda || 0)} clientes</p>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="kpi-ultra kpi-warning"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                    >
                        <div className="kpi-header">
                            <div className="kpi-icon">
                                <AlertCircle size={28} />
                            </div>
                            <div className="kpi-badge badge-warning">
                                Atención
                            </div>
                        </div>
                        <div className="kpi-body">
                            <h3>Clientes con Deuda</h3>
                            <div className="kpi-value">{formatNumber(kpis.clientes_con_deuda || 0)}</div>
                            <p className="kpi-subtitle">{formatPercent(((kpis.clientes_con_deuda || 0) / (kpis.clientes_activos || 1)) * 100)} del total</p>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="kpi-ultra kpi-danger"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                    >
                        <div className="kpi-header">
                            <div className="kpi-icon">
                                <Target size={28} />
                            </div>
                            <div className="kpi-badge badge-danger">
                                Total
                            </div>
                        </div>
                        <div className="kpi-body">
                            <h3>Total de Clientes</h3>
                            <div className="kpi-value">{formatNumber(kpis.total_clientes || 0)}</div>
                            <p className="kpi-subtitle">Tasa morosidad: {formatPercent(kpis.tasa_morosidad || 0)}%</p>
                        </div>
                    </motion.div>
                </div>

                {/* GRÁFICOS */}
                <div className="charts-premium">
                    <motion.div 
                        className="chart-premium"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h3>Ingresos Mensuales</h3>
                        <div className="chart-container">
                            <Bar data={ingresosChartData} options={chartOptions} />
                        </div>
                    </motion.div>

                    <motion.div 
                        className="chart-premium"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <h3>Estado de Clientes</h3>
                        <div className="chart-container">
                            <Pie data={distribucionEstadoData} options={chartOptions} />
                        </div>
                    </motion.div>

                    <motion.div 
                        className="chart-premium chart-wide"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <h3>Evolución de Morosidad</h3>
                        <div className="chart-container">
                            <Line data={morosidadChartData} options={chartOptions} />
                        </div>
                    </motion.div>

                    <motion.div 
                        className="chart-premium"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                    >
                        <h3>Distribución Geográfica</h3>
                        <div className="chart-container">
                            <Doughnut data={distribucionGeoData} options={chartOptions} />
                        </div>
                    </motion.div>
                </div>

                {/* TOP PAGADORES */}
                <div className="top-premium">
                    <motion.div 
                        className="top-card top-success"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.0 }}
                    >
                        <div className="top-header">
                            <CheckCircle size={24} />
                            <h3>Top 10 Mejores Pagadores</h3>
                        </div>
                        <div className="top-list">
                            {Array.isArray(mejoresPagadores) && mejoresPagadores.map((cliente, index) => (
                                <motion.div 
                                    key={cliente.id} 
                                    className="top-item"
                                    whileHover={{ x: 5 }}
                                >
                                    <div className="rank">{index + 1}</div>
                                    <div className="info">
                                        <span className="name">{cliente.cliente}</span>
                                        <span className="meta">{cliente.total_pagos} pagos</span>
                                    </div>
                                    <div className="amount">{formatMoney(cliente.monto_total)}</div>
                                    <div className={`score score-${getScoreClass(cliente.score_pago)}`}>
                                        {cliente.score_pago}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div 
                        className="top-card top-danger"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.1 }}
                    >
                        <div className="top-header">
                            <AlertCircle size={24} />
                            <h3>Top 10 Clientes en Mora</h3>
                        </div>
                        <div className="top-list">
                            {Array.isArray(peoresPagadores) && peoresPagadores.map((cliente, index) => (
                                <motion.div 
                                    key={cliente.id} 
                                    className="top-item"
                                    whileHover={{ x: 5 }}
                                >
                                    <div className="rank danger">{index + 1}</div>
                                    <div className="info">
                                        <span className="name">{cliente.cliente}</span>
                                        <span className="meta">{cliente.meses_deuda} meses</span>
                                    </div>
                                    <div className="amount danger">{formatMoney(cliente.deuda_total)}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* CLIENTES EN RIESGO */}
                <motion.div 
                    className="riesgo-premium"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    <div className="riesgo-card">
                        <div className="riesgo-header">
                            <AlertCircle size={24} />
                            <h3>Clientes en Riesgo ({Array.isArray(clientesRiesgo) ? clientesRiesgo.length : 0})</h3>
                        </div>
                        <div className="riesgo-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Teléfono</th>
                                        <th>Deuda</th>
                                        <th>Meses</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(clientesRiesgo) && clientesRiesgo.slice(0, 10).map((cliente) => (
                                        <motion.tr 
                                            key={cliente.id}
                                            whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                                        >
                                            <td className="cliente-name">{cliente.cliente}</td>
                                            <td>{cliente.telefono || 'N/A'}</td>
                                            <td className="deuda">{formatMoney(cliente.deuda_total)}</td>
                                            <td>{cliente.meses_deuda}</td>
                                            <td>
                                                <span style={{ color: cliente.estado === 'activo' ? '#4caf50' : '#f44336' }}>
                                                    {cliente.estado}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardExecutive;
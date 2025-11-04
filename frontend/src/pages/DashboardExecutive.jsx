// ============================================
// frontend/src/pages/DashboardExecutive.jsx
// DASHBOARD EJECUTIVO - ESTILO APPLE FUTURISTA
// ============================================

import React, { useState, useEffect } from 'react';
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
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    AlertTriangle,
    CheckCircle,
    Clock,
    Activity
} from 'lucide-react';
import api from '../services/api';
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
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({});
    const [ingresosMensuales, setIngresosMensuales] = useState([]);
    const [mejoresPagadores, setMejoresPagadores] = useState([]);
    const [peoresPagadores, setPeoresPagadores] = useState([]);
    const [distribucionEstado, setDistribucionEstado] = useState([]);
    const [tasaMorosidad, setTasaMorosidad] = useState([]);
    const [proyeccion, setProyeccion] = useState({});
    const [clientesRiesgo, setClientesRiesgo] = useState([]);
    const [distribucionGeo, setDistribucionGeo] = useState([]);

    useEffect(() => {
        cargarDatos();
        const interval = setInterval(cargarDatos, 300000);
        return () => clearInterval(interval);
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            
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
                api.get('/dashboard/kpis'),
                api.get('/dashboard/ingresos-mensuales'),
                api.get('/dashboard/mejores-pagadores'),
                api.get('/dashboard/peores-pagadores'),
                api.get('/dashboard/distribucion-estado'),
                api.get('/dashboard/tasa-morosidad'),
                api.get('/dashboard/proyeccion-ingresos'),
                api.get('/dashboard/clientes-riesgo'),
                api.get('/dashboard/distribucion-geografica')
            ]);

            setKpis(kpisRes.data);
            setIngresosMensuales(ingresosRes.data);
            setMejoresPagadores(mejoresRes.data);
            setPeoresPagadores(peoresRes.data);
            setDistribucionEstado(distEstadoRes.data);
            setTasaMorosidad(tasaMorRes.data);
            setProyeccion(proyRes.data);
            setClientesRiesgo(riesgoRes.data);
            setDistribucionGeo(geoRes.data);
            
            setLoading(false);
        } catch (error) {
            console.error('Error cargando dashboard:', error);
            setLoading(false);
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

    const getScoreClass = (score) => {
        if (score >= 80) return 'excelente';
        if (score >= 60) return 'bueno';
        if (score >= 40) return 'regular';
        if (score >= 20) return 'malo';
        return 'critico';
    };

    // Configuración de gráficos con estilo Apple
    const chartOptionsApple = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleColor: '#fff',
                bodyColor: '#fff',
                cornerRadius: 8,
                displayColors: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: '#86868b'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#86868b'
                }
            }
        }
    };

    const ingresosChartData = {
        labels: ingresosMensuales.map(d => d.mes),
        datasets: [{
            label: 'Ingresos',
            data: ingresosMensuales.map(d => parseFloat(d.total)),
            backgroundColor: 'rgba(0, 122, 255, 0.8)',
            borderColor: 'rgba(0, 122, 255, 1)',
            borderWidth: 3,
            borderRadius: 8
        }]
    };

    const distribucionEstadoData = {
        labels: distribucionEstado.map(d => d.estado),
        datasets: [{
            data: distribucionEstado.map(d => d.cantidad),
            backgroundColor: [
                'rgba(52, 199, 89, 0.8)',
                'rgba(255, 149, 0, 0.8)',
                'rgba(255, 59, 48, 0.8)'
            ],
            borderWidth: 0
        }]
    };

    const morosidadChartData = {
        labels: tasaMorosidad.map(d => new Date(d.fecha).toLocaleDateString('es-PE', { month: 'short' })),
        datasets: [{
            label: 'Morosidad',
            data: tasaMorosidad.map(d => parseFloat(d.tasa_morosidad)),
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
        labels: distribucionGeo.map(d => d.zona),
        datasets: [{
            data: distribucionGeo.map(d => d.total_clientes),
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
                <p>Cargando datos...</p>
            </div>
        );
    }

    return (
        <div className="executive-dashboard">
            {/* Header Premium */}
            <motion.header 
                className="executive-header"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="header-content">
                    <motion.button
                        onClick={() => navigate('/dashboard')}
                        className="btn-back"
                        whileHover={{ x: -5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ArrowLeft size={20} />
                        <span>Panel de Control</span>
                    </motion.button>

                    <div className="header-title">
                        <h1>Dashboard Ejecutivo</h1>
                        <p>Análisis en tiempo real • {new Date().toLocaleDateString('es-PE', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</p>
                    </div>

                    <motion.button
                        onClick={cargarDatos}
                        className="btn-refresh"
                        whileHover={{ rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Activity size={20} />
                    </motion.button>
                </div>
            </motion.header>

            {/* KPIs Premium */}
            <div className="kpis-premium">
                <motion.div 
                    className="kpi-card kpi-primary"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ y: -5 }}
                >
                    <div className="kpi-icon">
                        <Users size={24} />
                    </div>
                    <div className="kpi-data">
                        <span className="kpi-label">Clientes Activos</span>
                        <span className="kpi-value">{formatNumber(kpis.clientes_activos)}</span>
                        <span className="kpi-trend positive">
                            <TrendingUp size={16} />
                            +12% vs mes anterior
                        </span>
                    </div>
                </motion.div>

                <motion.div 
                    className="kpi-card kpi-success"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ y: -5 }}
                >
                    <div className="kpi-icon">
                        <DollarSign size={24} />
                    </div>
                    <div className="kpi-data">
                        <span className="kpi-label">Ingresos del Mes</span>
                        <span className="kpi-value">{formatMoney(kpis.ingresos_mes)}</span>
                        <span className="kpi-trend positive">
                            <TrendingUp size={16} />
                            +8.5% vs mes anterior
                        </span>
                    </div>
                </motion.div>

                <motion.div 
                    className="kpi-card kpi-warning"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ y: -5 }}
                >
                    <div className="kpi-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="kpi-data">
                        <span className="kpi-label">Con Deuda</span>
                        <span className="kpi-value">{formatNumber(kpis.clientes_con_deuda)}</span>
                        <span className="kpi-trend negative">
                            <TrendingDown size={16} />
                            Requiere atención
                        </span>
                    </div>
                </motion.div>

                <motion.div 
                    className="kpi-card kpi-danger"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ y: -5 }}
                >
                    <div className="kpi-icon">
                        <Clock size={24} />
                    </div>
                    <div className="kpi-data">
                        <span className="kpi-label">Deuda Total</span>
                        <span className="kpi-value">{formatMoney(kpis.deuda_total)}</span>
                        <span className="kpi-trend negative">
                            <TrendingDown size={16} />
                            Gestionar cobranza
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Proyección Premium */}
            <motion.div 
                className="proyeccion-premium"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <div className="proyeccion-header">
                    <h2>Proyección de Ingresos</h2>
                    <span className="proyeccion-percentage">
                        {((proyeccion.ingresado / proyeccion.proyeccion_total * 100) || 0).toFixed(1)}%
                    </span>
                </div>
                <div className="proyeccion-bar">
                    <motion.div 
                        className="proyeccion-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${(proyeccion.ingresado / proyeccion.proyeccion_total * 100) || 0}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
                <div className="proyeccion-stats">
                    <div className="proyeccion-stat">
                        <span className="label">Ingresado</span>
                        <span className="value success">{formatMoney(proyeccion.ingresado)}</span>
                    </div>
                    <div className="proyeccion-stat">
                        <span className="label">Por Ingresar</span>
                        <span className="value info">{formatMoney(proyeccion.por_ingresar)}</span>
                    </div>
                    <div className="proyeccion-stat">
                        <span className="label">Total Proyectado</span>
                        <span className="value primary">{formatMoney(proyeccion.proyeccion_total)}</span>
                    </div>
                </div>
            </motion.div>

            {/* Gráficos Premium */}
            <div className="charts-premium">
                <motion.div 
                    className="chart-premium"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3>Ingresos Mensuales</h3>
                    <div className="chart-container">
                        <Bar data={ingresosChartData} options={chartOptionsApple} />
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
                        <Pie data={distribucionEstadoData} options={chartOptionsApple} />
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
                        <Line data={morosidadChartData} options={chartOptionsApple} />
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
                        <Doughnut data={distribucionGeoData} options={chartOptionsApple} />
                    </div>
                </motion.div>
            </div>

            {/* Top Pagadores */}
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
                        {mejoresPagadores.map((cliente, index) => (
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
                        <AlertTriangle size={24} />
                        <h3>Top 10 Clientes en Mora</h3>
                    </div>
                    <div className="top-list">
                        {peoresPagadores.map((cliente, index) => (
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
                                <div className="zone">{cliente.zona_geografica || 'N/A'}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Clientes en Riesgo */}
            <motion.div 
                className="riesgo-premium"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                <div className="riesgo-header">
                    <AlertTriangle size={24} />
                    <h3>Clientes en Riesgo ({clientesRiesgo.length})</h3>
                </div>
                <div className="riesgo-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Teléfono</th>
                                <th>Deuda</th>
                                <th>Score</th>
                                <th>Riesgo</th>
                                <th>Último Pago</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientesRiesgo.slice(0, 10).map((cliente) => (
                                <motion.tr 
                                    key={cliente.id}
                                    whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                                >
                                    <td className="cliente-name">{cliente.cliente}</td>
                                    <td>{cliente.telefono || 'N/A'}</td>
                                    <td className="deuda">{formatMoney(cliente.deuda_total)}</td>
                                    <td>
                                        <span className={`score score-${getScoreClass(cliente.score_pago)}`}>
                                            {cliente.score_pago}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`riesgo riesgo-${cliente.nivel_riesgo.toLowerCase()}`}>
                                            {cliente.nivel_riesgo}
                                        </span>
                                    </td>
                                    <td>
                                        {cliente.fecha_ultimo_pago 
                                            ? new Date(cliente.fecha_ultimo_pago).toLocaleDateString('es-PE')
                                            : 'Nunca'
                                        }
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default DashboardExecutive;
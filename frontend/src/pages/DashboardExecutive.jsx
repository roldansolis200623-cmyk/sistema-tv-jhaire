// ============================================
// frontend/src/pages/DashboardExecutive.jsx
// DASHBOARD EJECUTIVO PRO
// ============================================

import React, { useState, useEffect } from 'react';
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
import api from '../services/api';
import './DashboardExecutive.css';

// Registrar componentes de Chart.js
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
        // Recargar cada 5 minutos
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

    // ============================================
    // CONFIGURACIONES DE GRÁFICOS
    // ============================================

    const ingresosChartData = {
        labels: ingresosMensuales.map(d => d.mes),
        datasets: [{
            label: 'Ingresos Mensuales (S/)',
            data: ingresosMensuales.map(d => parseFloat(d.total)),
            backgroundColor: 'rgba(102, 126, 234, 0.6)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 2,
            borderRadius: 8,
            hoverBackgroundColor: 'rgba(118, 75, 162, 0.8)'
        }]
    };

    const ingresosChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Ingresos Mensuales (Últimos 12 meses)',
                font: { size: 16, weight: 'bold' },
                color: '#333'
            },
            tooltip: {
                callbacks: {
                    label: (context) => `S/ ${context.parsed.y.toFixed(2)}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => `S/ ${value}`
                }
            }
        }
    };

    const distribucionEstadoData = {
        labels: distribucionEstado.map(d => d.estado),
        datasets: [{
            data: distribucionEstado.map(d => d.cantidad),
            backgroundColor: [
                'rgba(16, 185, 129, 0.8)',  // Verde - Activo
                'rgba(245, 158, 11, 0.8)',   // Amarillo - Suspendido
                'rgba(239, 68, 68, 0.8)'     // Rojo - Cortado
            ],
            borderColor: '#fff',
            borderWidth: 2
        }]
    };

    const distribucionEstadoOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: { size: 12 }
                }
            },
            title: {
                display: true,
                text: 'Distribución por Estado',
                font: { size: 16, weight: 'bold' }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    const morosidadChartData = {
        labels: tasaMorosidad.map(d => new Date(d.fecha).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })),
        datasets: [{
            label: 'Tasa de Morosidad (%)',
            data: tasaMorosidad.map(d => parseFloat(d.tasa_morosidad)),
            fill: true,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgba(239, 68, 68, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        }]
    };

    const morosidadChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Evolución Tasa de Morosidad (6 meses)',
                font: { size: 16, weight: 'bold' }
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.parsed.y.toFixed(2)}%`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: (value) => `${value}%`
                }
            }
        }
    };

    const distribucionGeoData = {
        labels: distribucionGeo.map(d => d.zona),
        datasets: [{
            label: 'Clientes por Zona',
            data: distribucionGeo.map(d => d.total_clientes),
            backgroundColor: [
                'rgba(102, 126, 234, 0.8)',
                'rgba(118, 75, 162, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)'
            ],
            borderWidth: 0
        }]
    };

    const distribucionGeoOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    padding: 10,
                    font: { size: 11 }
                }
            },
            title: {
                display: true,
                text: 'Distribución Geográfica',
                font: { size: 16, weight: 'bold' }
            }
        }
    };

    // ============================================
    // FORMATEO DE NÚMEROS
    // ============================================

    const formatMoney = (value) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(value || 0);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('es-PE').format(value || 0);
    };

    // ============================================
    // RENDER
    // ============================================

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Cargando dashboard ejecutivo...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-executive">
            <div className="dashboard-header">
                <h1>📊 Dashboard Ejecutivo</h1>
                <button onClick={cargarDatos} className="btn-refresh">
                    🔄 Actualizar
                </button>
            </div>

            {/* ============================================ */}
            {/* KPIs PRINCIPALES */}
            {/* ============================================ */}
            
            <div className="kpis-grid">
                <div className="kpi-card kpi-success">
                    <div className="kpi-icon">👥</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{formatNumber(kpis.clientes_activos)}</div>
                        <div className="kpi-label">Clientes Activos</div>
                    </div>
                </div>

                <div className="kpi-card kpi-info">
                    <div className="kpi-icon">💰</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{formatMoney(kpis.ingresos_mes)}</div>
                        <div className="kpi-label">Ingresos del Mes</div>
                    </div>
                </div>

                <div className="kpi-card kpi-warning">
                    <div className="kpi-icon">⚠️</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{formatNumber(kpis.clientes_con_deuda)}</div>
                        <div className="kpi-label">Clientes con Deuda</div>
                    </div>
                </div>

                <div className="kpi-card kpi-danger">
                    <div className="kpi-icon">💸</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{formatMoney(kpis.deuda_total)}</div>
                        <div className="kpi-label">Deuda Total</div>
                    </div>
                </div>

                <div className="kpi-card kpi-neutral">
                    <div className="kpi-icon">⏸️</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{formatNumber(kpis.clientes_suspendidos)}</div>
                        <div className="kpi-label">Suspendidos</div>
                    </div>
                </div>

                <div className="kpi-card kpi-primary">
                    <div className="kpi-icon">🎯</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{formatNumber(kpis.riesgo_alto)}</div>
                        <div className="kpi-label">Riesgo Alto</div>
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* PROYECCIÓN DE INGRESOS */}
            {/* ============================================ */}

            <div className="proyeccion-section">
                <div className="proyeccion-card">
                    <h3>💎 Proyección de Ingresos del Mes</h3>
                    <div className="proyeccion-breakdown">
                        <div className="proyeccion-item">
                            <span className="proyeccion-label">Ya ingresado:</span>
                            <span className="proyeccion-value proyeccion-success">
                                {formatMoney(proyeccion.ingresado)}
                            </span>
                        </div>
                        <div className="proyeccion-item">
                            <span className="proyeccion-label">Por ingresar:</span>
                            <span className="proyeccion-value proyeccion-info">
                                {formatMoney(proyeccion.por_ingresar)}
                            </span>
                        </div>
                        <div className="proyeccion-item">
                            <span className="proyeccion-label">Recuperación estimada:</span>
                            <span className="proyeccion-value proyeccion-warning">
                                {formatMoney(proyeccion.recuperacion_estimada)}
                            </span>
                        </div>
                        <div className="proyeccion-total">
                            <span className="proyeccion-label-total">PROYECCIÓN TOTAL:</span>
                            <span className="proyeccion-value-total">
                                {formatMoney(proyeccion.proyeccion_total)}
                            </span>
                        </div>
                    </div>
                    <div className="proyeccion-progress">
                        <div 
                            className="proyeccion-progress-bar"
                            style={{ 
                                width: `${(proyeccion.ingresado / proyeccion.proyeccion_total * 100) || 0}%` 
                            }}
                        ></div>
                    </div>
                    <p className="proyeccion-percentage">
                        {((proyeccion.ingresado / proyeccion.proyeccion_total * 100) || 0).toFixed(1)}% completado
                    </p>
                </div>
            </div>

            {/* ============================================ */}
            {/* GRÁFICOS PRINCIPALES */}
            {/* ============================================ */}

            <div className="charts-grid">
                {/* Ingresos Mensuales */}
                <div className="chart-card">
                    <div className="chart-container">
                        <Bar data={ingresosChartData} options={ingresosChartOptions} />
                    </div>
                </div>

                {/* Distribución por Estado */}
                <div className="chart-card">
                    <div className="chart-container">
                        <Pie data={distribucionEstadoData} options={distribucionEstadoOptions} />
                    </div>
                </div>

                {/* Tasa de Morosidad */}
                <div className="chart-card chart-wide">
                    <div className="chart-container">
                        <Line data={morosidadChartData} options={morosidadChartOptions} />
                    </div>
                </div>

                {/* Distribución Geográfica */}
                <div className="chart-card">
                    <div className="chart-container">
                        <Doughnut data={distribucionGeoData} options={distribucionGeoOptions} />
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* TOP 10 MEJORES PAGADORES */}
            {/* ============================================ */}

            <div className="top-section">
                <div className="top-card top-success">
                    <h3>🏆 Top 10 Mejores Pagadores</h3>
                    <div className="top-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Cliente</th>
                                    <th>DNI</th>
                                    <th>Pagos</th>
                                    <th>Total</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mejoresPagadores.map((cliente, index) => (
                                    <tr key={cliente.id}>
                                        <td className="top-rank">{index + 1}</td>
                                        <td className="top-name">{cliente.cliente}</td>
                                        <td>{cliente.dni}</td>
                                        <td>{cliente.total_pagos}</td>
                                        <td className="top-amount">{formatMoney(cliente.monto_total)}</td>
                                        <td>
                                            <span className={`score-badge score-${getScoreClass(cliente.score_pago)}`}>
                                                {cliente.score_pago}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ============================================ */}
                {/* TOP 10 PEORES PAGADORES */}
                {/* ============================================ */}

                <div className="top-card top-danger">
                    <h3>⚠️ Top 10 Peores Pagadores</h3>
                    <div className="top-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Cliente</th>
                                    <th>Teléfono</th>
                                    <th>Meses</th>
                                    <th>Deuda</th>
                                    <th>Zona</th>
                                </tr>
                            </thead>
                            <tbody>
                                {peoresPagadores.map((cliente, index) => (
                                    <tr key={cliente.id}>
                                        <td className="top-rank">{index + 1}</td>
                                        <td className="top-name">{cliente.cliente}</td>
                                        <td>{cliente.telefono || 'N/A'}</td>
                                        <td>
                                            <span className="deuda-badge">
                                                {cliente.meses_deuda} {cliente.meses_deuda === 1 ? 'mes' : 'meses'}
                                            </span>
                                        </td>
                                        <td className="top-amount">{formatMoney(cliente.deuda_total)}</td>
                                        <td>{cliente.zona_geografica || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* CLIENTES EN RIESGO */}
            {/* ============================================ */}

            <div className="riesgo-section">
                <div className="riesgo-card">
                    <h3>🚨 Clientes en Riesgo ({clientesRiesgo.length})</h3>
                    <div className="riesgo-table-container">
                        <table className="riesgo-table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Teléfono</th>
                                    <th>Deuda</th>
                                    <th>Score</th>
                                    <th>Riesgo</th>
                                    <th>Zona</th>
                                    <th>Último Pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientesRiesgo.slice(0, 10).map((cliente) => (
                                    <tr key={cliente.id}>
                                        <td className="cliente-name">{cliente.cliente}</td>
                                        <td>{cliente.telefono || 'N/A'}</td>
                                        <td className="deuda-amount">{formatMoney(cliente.deuda_total)}</td>
                                        <td>
                                            <span className={`score-badge score-${getScoreClass(cliente.score_pago)}`}>
                                                {cliente.score_pago}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`riesgo-badge riesgo-${cliente.nivel_riesgo.toLowerCase()}`}>
                                                {cliente.nivel_riesgo}
                                            </span>
                                        </td>
                                        <td>{cliente.zona_geografica || 'N/A'}</td>
                                        <td>
                                            {cliente.fecha_ultimo_pago 
                                                ? new Date(cliente.fecha_ultimo_pago).toLocaleDateString('es-PE')
                                                : 'Nunca'
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function para clases de score
const getScoreClass = (score) => {
    if (score >= 80) return 'excelente';
    if (score >= 60) return 'bueno';
    if (score >= 40) return 'regular';
    if (score >= 20) return 'malo';
    return 'critico';
};

export default DashboardExecutive;
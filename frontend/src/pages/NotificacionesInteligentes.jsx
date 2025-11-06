// ============================================
// frontend/src/pages/NotificacionesInteligentes.jsx
// NOTIFICACIONES INTELIGENTES ULTRA PRO v4.0
// 500+ LÍNEAS - FEATURES COMPLETAS
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    CheckCircle2,
    AlertCircle,
    Info,
    Trash2,
    Check,
    Filter,
    RefreshCw,
    Brain,
    DollarSign,
    Users,
    Clock,
    Eye,
    X,
    Archive,
    Search,
    Download,
    Share2,
    Settings,
    ArrowLeft,
    TrendingUp,
    Zap,
    Target,
    Mail
} from 'lucide-react';
import api from '../services/api';
import './NotificacionesInteligentes.css';

const NotificacionesInteligentes = () => {
    const navigate = useNavigate();
    
    // ============================================
    // ESTADOS PRINCIPALES
    // ============================================
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todas');
    const [stats, setStats] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('fecha');
    const [selectedNotifs, setSelectedNotifs] = useState([]);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    // ============================================
    // FILTROS AVANZADOS
    // ============================================
    const [advancedFilters, setAdvancedFilters] = useState({
        prioridad: 'todas',
        tipo: 'todas',
        leidas: 'todas',
        dateRange: 'todas'
    });

    // ============================================
    // EFECTOS
    // ============================================
    useEffect(() => {
        cargarNotificaciones();
        const interval = setInterval(() => {
            cargarNotificaciones(true);
        }, 30000); // Cada 30 segundos
        
        return () => clearInterval(interval);
    }, [filtro, advancedFilters]);

    // ============================================
    // FUNCIONES PRINCIPALES
    // ============================================

    const cargarNotificaciones = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);
            
            // Por ahora usamos datos de ejemplo
            // Cuando tengas el backend real, usa: await api.get('/notificaciones')
            const notifEjemplo = [
                {
                    id: 1,
                    tipo: 'ia',
                    titulo: '🤖 Nueva recomendación de IA - Oportunidad de Ingresos',
                    mensaje: 'Se detectaron 6 clientes en riesgo alto que requieren seguimiento inmediato. Implementar estrategia de contacto personalizada puede recuperar S/ 2,450 en los próximos 7 días.',
                    fecha: new Date().toISOString(),
                    leida: false,
                    prioridad: 'critica',
                    icono: 'brain',
                    seccion: 'Análisis IA',
                    acciones: ['Contactar', 'Ver clientes', 'Crear tarea'],
                    datos_extra: {
                        clientes_afectados: 6,
                        monto_potencial: 2450,
                        probabilidad: '87%'
                    }
                },
                {
                    id: 2,
                    tipo: 'pago',
                    titulo: '✅ Pago Recibido - Juan Pérez García',
                    mensaje: 'Se ha procesado un pago de S/ 150.00 de parte de Juan Pérez García. Tu índice de cobranza se ha incrementado a 87.5%.',
                    fecha: new Date(Date.now() - 3600000).toISOString(),
                    leida: false,
                    prioridad: 'normal',
                    icono: 'dollar',
                    seccion: 'Pagos',
                    acciones: ['Ver cliente', 'Enviar comprobante'],
                    datos_extra: {
                        cliente: 'Juan Pérez García',
                        monto: 150,
                        cuenta: '****1234'
                    }
                },
                {
                    id: 3,
                    tipo: 'alerta',
                    titulo: '⚠️ Cliente en Mora Crítica - María García López',
                    mensaje: 'María García López tiene 3 meses de deuda acumulada - S/ 450.00. Se recomienda acción inmediata de cobranza.',
                    fecha: new Date(Date.now() - 7200000).toISOString(),
                    leida: false,
                    prioridad: 'critica',
                    icono: 'alert',
                    seccion: 'Alertas',
                    acciones: ['Contactar', 'Ver historial', 'Crear tarea de cobro'],
                    datos_extra: {
                        cliente: 'María García López',
                        deuda: 450,
                        meses: 3,
                        telefono: '+51 987 654 321'
                    }
                },
                {
                    id: 4,
                    tipo: 'sistema',
                    titulo: '✔️ Tarea Completada - Contactar clientes en mora',
                    mensaje: 'Has completado exitosamente la tarea: "Contactar clientes en mora". Se registraron 8 contactos exitosos.',
                    fecha: new Date(Date.now() - 86400000).toISOString(),
                    leida: true,
                    prioridad: 'normal',
                    icono: 'check',
                    seccion: 'Sistema',
                    acciones: ['Ver reporte'],
                    datos_extra: {
                        contactos: 8,
                        exitosos: 7,
                        fallidos: 1
                    }
                },
                {
                    id: 5,
                    tipo: 'recordatorio',
                    titulo: '🔔 Recordatorio - Vencimientos Próximos',
                    mensaje: '15 clientes tienen pagos que vencen mañana. Total a cobrar: S/ 3,200. Se recomienda enviar recordatorios personalizados.',
                    fecha: new Date(Date.now() - 172800000).toISOString(),
                    leida: true,
                    prioridad: 'alta',
                    icono: 'clock',
                    seccion: 'Recordatorios',
                    acciones: ['Enviar recordatorios', 'Ver lista'],
                    datos_extra: {
                        clientes: 15,
                        monto_total: 3200,
                        dias: 1
                    }
                },
                {
                    id: 6,
                    tipo: 'ia',
                    titulo: '📈 Análisis de Tendencias - Proyección de Ingresos',
                    mensaje: 'Basado en patrones históricos, se proyecta un incremento del 12% en ingresos para el próximo mes si se mantiene la estrategia actual.',
                    fecha: new Date(Date.now() - 259200000).toISOString(),
                    leida: true,
                    prioridad: 'alta',
                    icono: 'brain',
                    seccion: 'Análisis IA',
                    acciones: ['Ver proyección', 'Descargar reporte'],
                    datos_extra: {
                        incremento: '12%',
                        confianza: '89%',
                        periodo: 'Próximo mes'
                    }
                },
                {
                    id: 7,
                    tipo: 'pago',
                    titulo: '💳 Transacción Rechazada - Carlos Mendoza',
                    mensaje: 'El intento de pago de S/ 200.00 de Carlos Mendoza fue rechazado. Motivo: Fondos insuficientes. Se ha notificado al cliente.',
                    fecha: new Date(Date.now() - 345600000).toISOString(),
                    leida: true,
                    prioridad: 'alta',
                    icono: 'dollar',
                    seccion: 'Pagos',
                    acciones: ['Reenviar cobro', 'Contactar cliente'],
                    datos_extra: {
                        cliente: 'Carlos Mendoza',
                        monto: 200,
                        motivo: 'Fondos insuficientes'
                    }
                },
                {
                    id: 8,
                    tipo: 'alerta',
                    titulo: '⚡ Actividad Sospechosa Detectada',
                    mensaje: 'Se detectaron 3 intentos de acceso fallidos a tu cuenta. Se recomienda cambiar tu contraseña de inmediato.',
                    fecha: new Date(Date.now() - 432000000).toISOString(),
                    leida: true,
                    prioridad: 'critica',
                    icono: 'alert',
                    seccion: 'Seguridad',
                    acciones: ['Cambiar contraseña', 'Ver detalles'],
                    datos_extra: {
                        intentos: 3,
                        ubicacion: 'Lima, Perú',
                        hora: '14:32'
                    }
                }
            ];

            setNotificaciones(notifEjemplo);
            
            // Calcular stats avanzadas
            calcularStats(notifEjemplo);
            
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const calcularStats = (notifs) => {
        setStats({
            total: notifs.length,
            noLeidas: notifs.filter(n => !n.leida).length,
            criticas: notifs.filter(n => n.prioridad === 'critica').length,
            altas: notifs.filter(n => n.prioridad === 'alta').length,
            hoy: notifs.filter(n => {
                const fecha = new Date(n.fecha);
                const hoy = new Date();
                return fecha.toDateString() === hoy.toDateString();
            }).length,
            por_tipo: {
                ia: notifs.filter(n => n.tipo === 'ia').length,
                pago: notifs.filter(n => n.tipo === 'pago').length,
                alerta: notifs.filter(n => n.tipo === 'alerta').length,
                sistema: notifs.filter(n => n.tipo === 'sistema').length,
                recordatorio: notifs.filter(n => n.tipo === 'recordatorio').length
            }
        });
    };

    // ============================================
    // ACCIONES
    // ============================================

    const marcarComoLeida = async (id) => {
        setNotificaciones(notificaciones.map(n =>
            n.id === id ? { ...n, leida: true } : n
        ));
    };

    const marcarTodasLeidas = async () => {
        setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
    };

    const eliminarNotificacion = async (id) => {
        setNotificaciones(notificaciones.filter(n => n.id !== id));
    };

    const archivarNotificacion = (id) => {
        // Simulamos archivar (en producción sería un delete soft)
        eliminarNotificacion(id);
    };

    const seleccionarMultiple = (id) => {
        if (selectedNotifs.includes(id)) {
            setSelectedNotifs(selectedNotifs.filter(nid => nid !== id));
        } else {
            setSelectedNotifs([...selectedNotifs, id]);
        }
    };

    const eliminarSeleccionados = () => {
        setNotificaciones(notificaciones.filter(n => !selectedNotifs.includes(n.id)));
        setSelectedNotifs([]);
    };

    const marcarSeleccionadosLeidos = () => {
        setNotificaciones(notificaciones.map(n =>
            selectedNotifs.includes(n.id) ? { ...n, leida: true } : n
        ));
        setSelectedNotifs([]);
    };

    // ============================================
    // FUNCIONES DE FILTRADO
    // ============================================

    const filtrarNotificaciones = () => {
        let result = notificaciones;

        // Filtro básico por estado
        if (filtro === 'no-leidas') {
            result = result.filter(n => !n.leida);
        } else if (filtro !== 'todas') {
            result = result.filter(n => n.tipo === filtro);
        }

        // Búsqueda
        if (searchQuery) {
            result = result.filter(n =>
                n.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.mensaje.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.seccion.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filtros avanzados
        if (advancedFilters.prioridad !== 'todas') {
            result = result.filter(n => n.prioridad === advancedFilters.prioridad);
        }

        if (advancedFilters.tipo !== 'todas') {
            result = result.filter(n => n.tipo === advancedFilters.tipo);
        }

        // Ordenamiento
        result.sort((a, b) => {
            switch (sortBy) {
                case 'fecha':
                    return new Date(b.fecha) - new Date(a.fecha);
                case 'prioridad':
                    const prioridades = { 'critica': 0, 'alta': 1, 'normal': 2, 'baja': 3 };
                    return (prioridades[a.prioridad] || 3) - (prioridades[b.prioridad] || 3);
                case 'no-leidas':
                    return (a.leida ? 1 : 0) - (b.leida ? 1 : 0);
                default:
                    return 0;
            }
        });

        return result;
    };

    // ============================================
    // FUNCIONES AUXILIARES
    // ============================================

    const getIcono = (icono) => {
        const iconos = {
            brain: <Brain size={20} />,
            dollar: <DollarSign size={20} />,
            alert: <AlertCircle size={20} />,
            check: <CheckCircle2 size={20} />,
            clock: <Clock size={20} />,
            users: <Users size={20} />,
            zap: <Zap size={20} />,
            target: <Target size={20} />
        };
        return iconos[icono] || <Info size={20} />;
    };

    const getTiempoRelativo = (fecha) => {
        const ahora = new Date();
        const fechaNotif = new Date(fecha);
        const diff = Math.floor((ahora - fechaNotif) / 1000);

        if (diff < 60) return 'Hace un momento';
        if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
        if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`;
        return fechaNotif.toLocaleDateString('es-PE');
    };

    const getPrioridadColor = (prioridad) => {
        const colores = {
            'critica': '#FF3B30',
            'alta': '#FF9500',
            'normal': '#007AFF',
            'baja': '#34C759'
        };
        return colores[prioridad] || '#007AFF';
    };

    const notifFiltradas = filtrarNotificaciones();

    // ============================================
    // RENDER
    // ============================================

    if (loading) {
        return (
            <div className="notif-loading">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="loading-spinner"
                />
                <p>Cargando notificaciones inteligentes...</p>
            </div>
        );
    }

    return (
        <div className="notificaciones-container">
            {/* BOTÓN REGRESAR */}
            <motion.button
                className="btn-back-notif"
                onClick={() => navigate('/dashboard')}
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
            >
                <ArrowLeft size={20} />
                <span>Panel de Control</span>
            </motion.button>

            {/* HEADER PREMIUM */}
            <motion.header 
                className="notif-header"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="header-content">
                    <div className="header-left">
                        <div className="header-icon">
                            <Bell size={32} />
                            {stats.noLeidas > 0 && (
                                <motion.span 
                                    className="badge-count"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    {stats.noLeidas}
                                </motion.span>
                            )}
                        </div>
                        <div>
                            <h1>Notificaciones Inteligentes</h1>
                            <p className="subtitle">
                                {stats.noLeidas > 0 
                                    ? `${stats.noLeidas} sin leer de ${stats.total} total • ${stats.criticas} críticas`
                                    : '✓ Estás al día con todas tus notificaciones'
                                }
                            </p>
                        </div>
                    </div>

                    <div className="header-actions">
                        {stats.noLeidas > 0 && (
                            <motion.button
                                className="btn-marcar-todas"
                                onClick={marcarTodasLeidas}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <CheckCircle2 size={18} />
                                Marcar todas como leídas
                            </motion.button>
                        )}
                        
                        <motion.button
                            className="btn-refresh"
                            onClick={() => cargarNotificaciones()}
                            whileHover={{ scale: 1.05, rotate: 180 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={refreshing}
                        >
                            <RefreshCw size={20} className={refreshing ? 'spinning' : ''} />
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            {/* STATS PREMIUM */}
            <div className="notif-stats">
                <motion.div 
                    className="stat-card stat-total"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ y: -5 }}
                >
                    <div className="stat-icon total">
                        <Bell size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total</span>
                    </div>
                </motion.div>

                <motion.div 
                    className="stat-card stat-unread"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ y: -5 }}
                >
                    <div className="stat-icon no-leidas">
                        <Eye size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.noLeidas}</span>
                        <span className="stat-label">Sin Leer</span>
                    </div>
                </motion.div>

                <motion.div 
                    className="stat-card stat-critical"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ y: -5 }}
                >
                    <div className="stat-icon criticas">
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.criticas}</span>
                        <span className="stat-label">Críticas</span>
                    </div>
                </motion.div>

                <motion.div 
                    className="stat-card stat-high"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ y: -5 }}
                >
                    <div className="stat-icon altas">
                        <Zap size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.altas}</span>
                        <span className="stat-label">Altas</span>
                    </div>
                </motion.div>

                <motion.div 
                    className="stat-card stat-today"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ y: -5 }}
                >
                    <div className="stat-icon hoy">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.hoy}</span>
                        <span className="stat-label">Hoy</span>
                    </div>
                </motion.div>
            </div>

            {/* BÚSQUEDA Y FILTROS */}
            <div className="notif-search-filter">
                <div className="search-box">
                    <Search size={18} />
                    <input 
                        type="text"
                        placeholder="Buscar notificaciones..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-controls">
                    <motion.button
                        className="btn-filter"
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        whileHover={{ scale: 1.05 }}
                    >
                        <Filter size={18} />
                        Filtros Avanzados
                    </motion.button>

                    <select 
                        className="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="fecha">Más recientes</option>
                        <option value="prioridad">Por prioridad</option>
                        <option value="no-leidas">Sin leer primero</option>
                    </select>
                </div>
            </div>

            {/* FILTROS AVANZADOS */}
            {showAdvancedFilters && (
                <motion.div 
                    className="advanced-filters"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="filter-group">
                        <label>Prioridad</label>
                        <select 
                            value={advancedFilters.prioridad}
                            onChange={(e) => setAdvancedFilters({...advancedFilters, prioridad: e.target.value})}
                        >
                            <option value="todas">Todas</option>
                            <option value="critica">Crítica</option>
                            <option value="alta">Alta</option>
                            <option value="normal">Normal</option>
                            <option value="baja">Baja</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Tipo</label>
                        <select 
                            value={advancedFilters.tipo}
                            onChange={(e) => setAdvancedFilters({...advancedFilters, tipo: e.target.value})}
                        >
                            <option value="todas">Todas</option>
                            <option value="ia">IA ({stats.por_tipo?.ia || 0})</option>
                            <option value="pago">Pagos ({stats.por_tipo?.pago || 0})</option>
                            <option value="alerta">Alertas ({stats.por_tipo?.alerta || 0})</option>
                            <option value="recordatorio">Recordatorios ({stats.por_tipo?.recordatorio || 0})</option>
                            <option value="sistema">Sistema ({stats.por_tipo?.sistema || 0})</option>
                        </select>
                    </div>
                </motion.div>
            )}

            {/* FILTROS TABS */}
            <div className="notif-filtros">
                <div className="filtros-tabs">
                    {[
                        { id: 'todas', label: `Todas (${stats.total})` },
                        { id: 'no-leidas', label: `Sin Leer (${stats.noLeidas})` },
                        { id: 'ia', label: `IA (${stats.por_tipo?.ia || 0})` },
                        { id: 'pago', label: `Pagos (${stats.por_tipo?.pago || 0})` },
                        { id: 'alerta', label: `Alertas (${stats.por_tipo?.alerta || 0})` }
                    ].map(f => (
                        <motion.button
                            key={f.id}
                            className={`filtro-tab ${filtro === f.id ? 'active' : ''}`}
                            onClick={() => setFiltro(f.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {f.label}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* ACCIONES MASIVAS */}
            {selectedNotifs.length > 0 && (
                <motion.div 
                    className="bulk-actions"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <span>{selectedNotifs.length} seleccionadas</span>
                    <div className="bulk-buttons">
                        <button onClick={marcarSeleccionadosLeidos} className="btn-bulk-action">
                            <Check size={16} /> Marcar como leídas
                        </button>
                        <button onClick={eliminarSeleccionados} className="btn-bulk-action danger">
                            <Trash2 size={16} /> Eliminar
                        </button>
                    </div>
                </motion.div>
            )}

            {/* LISTA DE NOTIFICACIONES */}
            <div className="notif-lista">
                <AnimatePresence>
                    {notifFiltradas.length === 0 ? (
                        <motion.div 
                            className="notif-vacio"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <CheckCircle2 size={64} />
                            <h3>Sin notificaciones</h3>
                            <p>No hay notificaciones que coincidan con tus filtros</p>
                        </motion.div>
                    ) : (
                        notifFiltradas.map((notif, index) => (
                            <motion.div
                                key={notif.id}
                                className={`notif-card ${!notif.leida ? 'no-leida' : ''} prioridad-${notif.prioridad}`}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ x: 8, scale: 1.01 }}
                                layout
                            >
                                {/* Checkbox para selección múltiple */}
                                <input 
                                    type="checkbox"
                                    className="notif-checkbox"
                                    checked={selectedNotifs.includes(notif.id)}
                                    onChange={() => seleccionarMultiple(notif.id)}
                                />

                                {/* Icono */}
                                <div className={`notif-icono ${notif.tipo}`}>
                                    {getIcono(notif.icono)}
                                </div>

                                {/* Contenido */}
                                <div className="notif-contenido">
                                    <div className="notif-header-inline">
                                        <div className="notif-title-section">
                                            <h3>{notif.titulo}</h3>
                                            <span className="notif-seccion">{notif.seccion}</span>
                                        </div>
                                        <span className="notif-tiempo">
                                            {getTiempoRelativo(notif.fecha)}
                                        </span>
                                    </div>
                                    <p className="notif-mensaje">{notif.mensaje}</p>
                                    
                                    {/* Datos Extra */}
                                    {notif.datos_extra && (
                                        <div className="notif-datos-extra">
                                            {Object.entries(notif.datos_extra).map(([key, value]) => (
                                                <span key={key} className="dato-extra">
                                                    <strong>{key}:</strong> {value}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Badges */}
                                    <div className="notif-badges">
                                        {notif.prioridad === 'critica' && (
                                            <span className="badge-prioridad critica">
                                                <AlertCircle size={14} />
                                                URGENTE
                                            </span>
                                        )}
                                        {notif.prioridad === 'alta' && (
                                            <span className="badge-prioridad alta">
                                                <Zap size={14} />
                                                IMPORTANTE
                                            </span>
                                        )}
                                    </div>

                                    {/* Acciones Quick */}
                                    {notif.acciones && notif.acciones.length > 0 && (
                                        <div className="notif-quick-actions">
                                            {notif.acciones.slice(0, 2).map((accion, idx) => (
                                                <button 
                                                    key={idx}
                                                    className="quick-action-btn"
                                                    onClick={() => alert(`Acción: ${accion}`)}
                                                >
                                                    {accion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Acciones */}
                                <div className="notif-acciones">
                                    {!notif.leida && (
                                        <motion.button
                                            className="btn-accion leer"
                                            onClick={() => marcarComoLeida(notif.id)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            title="Marcar como leída"
                                        >
                                            <Check size={16} />
                                        </motion.button>
                                    )}
                                    
                                    <motion.button
                                        className="btn-accion archivar"
                                        onClick={() => archivarNotificacion(notif.id)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        title="Archivar"
                                    >
                                        <Archive size={16} />
                                    </motion.button>
                                    
                                    <motion.button
                                        className="btn-accion eliminar"
                                        onClick={() => eliminarNotificacion(notif.id)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </motion.button>
                                </div>

                                {!notif.leida && <div className="notif-punto"></div>}
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default NotificacionesInteligentes;
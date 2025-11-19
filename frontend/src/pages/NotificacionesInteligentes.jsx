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
import notificacionInteligenteService from '../services/notificacionInteligenteService';
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

            // ✅ CONECTADO A API REAL
            const filtros = {};

            // Aplicar filtros avanzados
            if (advancedFilters.prioridad !== 'todas') {
                filtros.prioridad = advancedFilters.prioridad.toUpperCase();
            }
            if (advancedFilters.tipo !== 'todas') {
                filtros.tipo = advancedFilters.tipo.toUpperCase();
            }
            if (advancedFilters.leidas !== 'todas') {
                filtros.leida = advancedFilters.leidas === 'leidas';
            }

            // Obtener notificaciones de la API
            const notificacionesAPI = await notificacionInteligenteService.obtenerTodas(filtros);

            // Mapear notificaciones del backend al formato del frontend
            const notificacionesMapeadas = notificacionesAPI.map(n => ({
                id: n.id,
                tipo: mapearTipo(n.tipo),
                titulo: n.titulo,
                mensaje: n.mensaje,
                fecha: n.fecha_creacion,
                leida: n.leida,
                prioridad: mapearPrioridad(n.prioridad),
                icono: mapearIcono(n.tipo),
                seccion: mapearSeccion(n.tipo),
                acciones: obtenerAcciones(n.tipo),
                cliente_id: n.cliente_id,
                nombre_cliente: n.nombre && n.apellido ? `${n.nombre} ${n.apellido}` : null,
                datos_extra: {
                    deuda_actual: n.deuda_actual,
                    patron_detectado: n.patron_detectado,
                    dias_sin_pagar: n.dias_sin_pagar,
                    accion_sugerida: n.accion_sugerida
                }
            }));

            setNotificaciones(notificacionesMapeadas);

            // Calcular stats avanzadas
            calcularStats(notificacionesMapeadas);

            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
            setNotificaciones([]);
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Funciones auxiliares de mapeo
    const mapearTipo = (tipoBackend) => {
        const mapeo = {
            'DEUDA_CRITICA': 'alerta',
            'PATRON_PAGO_DETECTADO': 'ia',
            'PROXIMO_VENCIMIENTO': 'recordatorio',
            'CLIENTE_NUEVO_SIN_PAGO': 'alerta',
            'CLIENTE_MEJORADO': 'pago'
        };
        return mapeo[tipoBackend] || 'sistema';
    };

    const mapearPrioridad = (prioridadBackend) => {
        const mapeo = {
            'CRITICAL': 'critica',
            'HIGH': 'alta',
            'MEDIUM': 'normal',
            'LOW': 'normal'
        };
        return mapeo[prioridadBackend] || 'normal';
    };

    const mapearIcono = (tipoBackend) => {
        const mapeo = {
            'DEUDA_CRITICA': 'alert',
            'PATRON_PAGO_DETECTADO': 'brain',
            'PROXIMO_VENCIMIENTO': 'clock',
            'CLIENTE_NUEVO_SIN_PAGO': 'alert',
            'CLIENTE_MEJORADO': 'check'
        };
        return mapeo[tipoBackend] || 'info';
    };

    const mapearSeccion = (tipoBackend) => {
        const mapeo = {
            'DEUDA_CRITICA': 'Alertas',
            'PATRON_PAGO_DETECTADO': 'Análisis IA',
            'PROXIMO_VENCIMIENTO': 'Recordatorios',
            'CLIENTE_NUEVO_SIN_PAGO': 'Alertas',
            'CLIENTE_MEJORADO': 'Pagos'
        };
        return mapeo[tipoBackend] || 'Sistema';
    };

    const obtenerAcciones = (tipoBackend) => {
        const mapeo = {
            'DEUDA_CRITICA': ['Contactar', 'Ver historial'],
            'PATRON_PAGO_DETECTADO': ['Ver patrón', 'Enviar recordatorio'],
            'PROXIMO_VENCIMIENTO': ['Enviar recordatorio', 'Ver cliente'],
            'CLIENTE_NUEVO_SIN_PAGO': ['Contactar', 'Ver cliente'],
            'CLIENTE_MEJORADO': ['Ver cliente', 'Agradecer']
        };
        return mapeo[tipoBackend] || ['Ver detalles'];
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
        try {
            await notificacionInteligenteService.marcarLeida(id);
            setNotificaciones(notificaciones.map(n =>
                n.id === id ? { ...n, leida: true } : n
            ));
        } catch (error) {
            console.error('Error marcando como leída:', error);
        }
    };

    const marcarTodasLeidas = async () => {
        try {
            const ids = notificaciones.filter(n => !n.leida).map(n => n.id);
            if (ids.length > 0) {
                await notificacionInteligenteService.marcarVariasLeidas(ids);
                setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
            }
        } catch (error) {
            console.error('Error marcando todas como leídas:', error);
        }
    };

    const eliminarNotificacion = async (id) => {
        try {
            await notificacionInteligenteService.archivar(id);
            setNotificaciones(notificaciones.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error eliminando notificación:', error);
        }
    };

    const archivarNotificacion = async (id) => {
        try {
            await notificacionInteligenteService.archivar(id);
            setNotificaciones(notificaciones.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error archivando notificación:', error);
        }
    };

    const archivarNotificacionOld = (id) => {
        // Simulamos archivar (en producción sería un delete soft)
        eliminarNotificacion(id);
    };

    const generarNotificaciones = async () => {
        try {
            setRefreshing(true);
            const resultado = await notificacionInteligenteService.generar();
            console.log('Notificaciones generadas:', resultado);
            // Recargar notificaciones después de generar
            await cargarNotificaciones(true);
        } catch (error) {
            console.error('Error generando notificaciones:', error);
            setRefreshing(false);
        }
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
                            className="btn-generar"
                            onClick={generarNotificaciones}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={refreshing}
                            title="Generar notificaciones inteligentes ahora"
                        >
                            <Zap size={18} />
                            Generar
                        </motion.button>

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

import React, { useState, useEffect } from 'react';
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
    X
} from 'lucide-react';
import api from '../services/api';
import './Notificaciones.css';

const Notificaciones = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todas');
    const [stats, setStats] = useState({});

    useEffect(() => {
        cargarNotificaciones();
    }, [filtro]);

    const cargarNotificaciones = async () => {
        try {
            setLoading(true);
            
            // Por ahora usamos datos de ejemplo
            // Cuando tengas el backend real, usa: await api.get('/notificaciones')
            const notifEjemplo = [
                {
                    id: 1,
                    tipo: 'ia',
                    titulo: 'Nueva recomendación de IA',
                    mensaje: 'Se detectaron 6 clientes en riesgo alto que requieren seguimiento inmediato',
                    fecha: new Date().toISOString(),
                    leida: false,
                    prioridad: 'alta',
                    icono: 'brain'
                },
                {
                    id: 2,
                    tipo: 'pago',
                    titulo: 'Pago recibido',
                    mensaje: 'Juan Pérez realizó un pago de S/ 150.00',
                    fecha: new Date(Date.now() - 3600000).toISOString(),
                    leida: false,
                    prioridad: 'normal',
                    icono: 'dollar'
                },
                {
                    id: 3,
                    tipo: 'alerta',
                    titulo: 'Cliente en mora crítica',
                    mensaje: 'María García tiene 3 meses de deuda acumulada - S/ 450.00',
                    fecha: new Date(Date.now() - 7200000).toISOString(),
                    leida: false,
                    prioridad: 'critica',
                    icono: 'alert'
                },
                {
                    id: 4,
                    tipo: 'sistema',
                    titulo: 'Tarea completada',
                    mensaje: 'Has completado la tarea: "Contactar clientes en mora"',
                    fecha: new Date(Date.now() - 86400000).toISOString(),
                    leida: true,
                    prioridad: 'normal',
                    icono: 'check'
                },
                {
                    id: 5,
                    tipo: 'recordatorio',
                    titulo: 'Recordatorio de vencimiento',
                    mensaje: '15 clientes tienen pagos que vencen mañana',
                    fecha: new Date(Date.now() - 172800000).toISOString(),
                    leida: true,
                    prioridad: 'normal',
                    icono: 'clock'
                }
            ];

            setNotificaciones(notifEjemplo);
            
            // Calcular stats
            setStats({
                total: notifEjemplo.length,
                noLeidas: notifEjemplo.filter(n => !n.leida).length,
                criticas: notifEjemplo.filter(n => n.prioridad === 'critica').length,
                hoy: notifEjemplo.filter(n => {
                    const fecha = new Date(n.fecha);
                    const hoy = new Date();
                    return fecha.toDateString() === hoy.toDateString();
                }).length
            });
            
            setLoading(false);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
            setLoading(false);
        }
    };

    const marcarComoLeida = async (id) => {
        try {
            setNotificaciones(notificaciones.map(n =>
                n.id === id ? { ...n, leida: true } : n
            ));
            // await api.put(`/notificaciones/${id}/leer`);
        } catch (error) {
            console.error('Error marcando como leída:', error);
        }
    };

    const marcarTodasLeidas = async () => {
        try {
            setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
            // await api.post('/notificaciones/leer-todas');
        } catch (error) {
            console.error('Error marcando todas como leídas:', error);
        }
    };

    const eliminarNotificacion = async (id) => {
        try {
            setNotificaciones(notificaciones.filter(n => n.id !== id));
            // await api.delete(`/notificaciones/${id}`);
        } catch (error) {
            console.error('Error eliminando notificación:', error);
        }
    };

    const getIcono = (icono) => {
        const iconos = {
            brain: <Brain size={20} />,
            dollar: <DollarSign size={20} />,
            alert: <AlertCircle size={20} />,
            check: <CheckCircle2 size={20} />,
            clock: <Clock size={20} />,
            users: <Users size={20} />
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

    const notifFiltradas = filtro === 'todas' 
        ? notificaciones 
        : filtro === 'no-leidas'
        ? notificaciones.filter(n => !n.leida)
        : notificaciones.filter(n => n.tipo === filtro);

    if (loading) {
        return (
            <div className="notif-loading">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="loading-spinner"
                />
                <p>Cargando notificaciones...</p>
            </div>
        );
    }

    return (
        <div className="notificaciones-container">
            {/* HEADER */}
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
                                <span className="badge-count">{stats.noLeidas}</span>
                            )}
                        </div>
                        <div>
                            <h1>Notificaciones</h1>
                            <p className="subtitle">
                                {stats.noLeidas > 0 
                                    ? `${stats.noLeidas} sin leer de ${stats.total} total`
                                    : 'Estás al día'
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
                            onClick={cargarNotificaciones}
                            whileHover={{ scale: 1.05, rotate: 180 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <RefreshCw size={20} />
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            {/* STATS */}
            <div className="notif-stats">
                <motion.div 
                    className="stat-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
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
                    className="stat-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
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
                    className="stat-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
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
                    className="stat-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
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

            {/* FILTROS */}
            <div className="notif-filtros">
                <div className="filtros-tabs">
                    {[
                        { id: 'todas', label: 'Todas' },
                        { id: 'no-leidas', label: 'Sin Leer' },
                        { id: 'ia', label: 'IA' },
                        { id: 'pago', label: 'Pagos' },
                        { id: 'alerta', label: 'Alertas' }
                    ].map(f => (
                        <button
                            key={f.id}
                            className={`filtro-tab ${filtro === f.id ? 'active' : ''}`}
                            onClick={() => setFiltro(f.id)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

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
                            <h3>No hay notificaciones</h3>
                            <p>Estás al día con todas tus notificaciones</p>
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
                                <div className={`notif-icono ${notif.tipo}`}>
                                    {getIcono(notif.icono)}
                                </div>

                                <div className="notif-contenido">
                                    <div className="notif-header-inline">
                                        <h3>{notif.titulo}</h3>
                                        <span className="notif-tiempo">
                                            {getTiempoRelativo(notif.fecha)}
                                        </span>
                                    </div>
                                    <p>{notif.mensaje}</p>
                                    
                                    {notif.prioridad === 'critica' && (
                                        <span className="badge-prioridad critica">
                                            <AlertCircle size={14} />
                                            Urgente
                                        </span>
                                    )}
                                    {notif.prioridad === 'alta' && (
                                        <span className="badge-prioridad alta">
                                            <Info size={14} />
                                            Importante
                                        </span>
                                    )}
                                </div>

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
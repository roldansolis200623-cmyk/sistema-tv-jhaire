import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import notificacionService from '../services/notificacionService';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [contador, setContador] = useState(0);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);
    const navigate = useNavigate();

    // Cerrar panel al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cargar contador inicial
    useEffect(() => {
        cargarContador();
        const interval = setInterval(cargarContador, 30000); // Cada 30 segundos
        return () => clearInterval(interval);
    }, []);

    const cargarContador = async () => {
        try {
            const data = await notificacionService.getContador();
            setContador(data.total);
        } catch (error) {
            console.error('Error cargando contador:', error);
        }
    };

    const cargarNotificaciones = async () => {
        try {
            setLoading(true);
            const data = await notificacionService.getNoLeidas();
            setNotificaciones(data);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            cargarNotificaciones();
        }
    };

    const handleMarcarLeida = async (id, url) => {
        try {
            await notificacionService.marcarComoLeida(id);
            setNotificaciones(notificaciones.filter(n => n.id !== id));
            setContador(Math.max(0, contador - 1));
            
            if (url) {
                setIsOpen(false);
                navigate(url);
            }
        } catch (error) {
            console.error('Error marcando como leída:', error);
        }
    };

    const handleMarcarTodasLeidas = async () => {
        try {
            await notificacionService.marcarTodasComoLeidas();
            setNotificaciones([]);
            setContador(0);
        } catch (error) {
            console.error('Error marcando todas como leídas:', error);
        }
    };

    const handleEliminar = async (id, e) => {
        e.stopPropagation();
        try {
            await notificacionService.eliminar(id);
            setNotificaciones(notificaciones.filter(n => n.id !== id));
            setContador(Math.max(0, contador - 1));
        } catch (error) {
            console.error('Error eliminando notificación:', error);
        }
    };

    const getIcono = (icono) => {
        switch (icono) {
            case 'alert': return <AlertCircle size={20} />;
            case 'success': return <CheckCircle size={20} />;
            case 'warning': return <AlertTriangle size={20} />;
            case 'info': 
            default: return <Info size={20} />;
        }
    };

    const getColorClasses = (color) => {
        switch (color) {
            case 'red': return 'bg-red-50 border-red-200 text-red-700';
            case 'green': return 'bg-green-50 border-green-200 text-green-700';
            case 'yellow': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
            case 'blue':
            default: return 'bg-blue-50 border-blue-200 text-blue-700';
        }
    };

    const formatFecha = (fecha) => {
        const date = new Date(fecha);
        const ahora = new Date();
        const diffMs = ahora - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins}m`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays}d`;
        return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* BOTÓN DE CAMPANA */}
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <Bell size={24} className="text-gray-700" />
                
                {/* BADGE */}
                {contador > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                        {contador > 99 ? '99+' : contador}
                    </motion.span>
                )}
            </button>

            {/* PANEL DE NOTIFICACIONES */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                    >
                        {/* HEADER */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-lg">Notificaciones</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            {contador > 0 && (
                                <button
                                    onClick={handleMarcarTodasLeidas}
                                    className="flex items-center gap-2 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <CheckCheck size={16} />
                                    Marcar todas como leídas
                                </button>
                            )}
                        </div>

                        {/* LISTA DE NOTIFICACIONES */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                    Cargando...
                                </div>
                            ) : notificaciones.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell size={48} className="mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">No tienes notificaciones</p>
                                    <p className="text-sm">Estás al día 🎉</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {notificaciones.map((notif) => (
                                        <motion.div
                                            key={notif.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            onClick={() => handleMarcarLeida(notif.id, notif.url)}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${getColorClasses(notif.color)}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 ${notif.color === 'red' ? 'text-red-600' : notif.color === 'green' ? 'text-green-600' : notif.color === 'yellow' ? 'text-yellow-600' : 'text-blue-600'}`}>
                                                    {getIcono(notif.icono)}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm text-gray-900 mb-1">
                                                        {notif.titulo}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 mb-2">
                                                        {notif.mensaje}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-400">
                                                            {formatFecha(notif.fecha_creacion)}
                                                        </span>
                                                        
                                                        <button
                                                            onClick={(e) => handleEliminar(notif.id, e)}
                                                            className="p-1 hover:bg-red-100 rounded transition-colors text-red-500"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
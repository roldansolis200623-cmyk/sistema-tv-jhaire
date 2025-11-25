import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Bell, X, CheckCheck, Trash2, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import notificacionInteligenteService from '../services/notificacionInteligenteService';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [contador, setContador] = useState(0);
    const [loading, setLoading] = useState(false);
    const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });
    const buttonRef = useRef(null);
    const navigate = useNavigate();

    // Calcular posición del botón
    useEffect(() => {
        if (buttonRef.current && isOpen) {
            const rect = buttonRef.current.getBoundingClientRect();
            setButtonPosition({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right
            });
        }
    }, [isOpen]);

    // Cargar contador inicial
    useEffect(() => {
        cargarContador();
        const interval = setInterval(cargarContador, 30000);
        return () => clearInterval(interval);
    }, []);

    const cargarContador = async () => {
        try {
            const data = await notificacionInteligenteService.obtenerResumen();
            console.log('📊 Contador notificaciones inteligentes:', data);
            setContador(data.no_leidas || 0);
        } catch (error) {
            console.error('❌ Error cargando contador:', error);
            setContador(0);
        }
    };

    const cargarNotificaciones = async () => {
        try {
            setLoading(true);
            console.log('🔄 Cargando notificaciones inteligentes...');
            const data = await notificacionInteligenteService.obtenerTodas({ leida: false, limit: 50 });
            console.log('📬 Notificaciones inteligentes recibidas:', data);
            setNotificaciones(data || []);
        } catch (error) {
            console.error('❌ Error cargando notificaciones:', error);
            setNotificaciones([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        console.log('🔔 Toggle notificaciones');
        setIsOpen(!isOpen);
        if (!isOpen) {
            cargarNotificaciones();
        }
    };

    const handleMarcarLeida = async (id, clienteId) => {
        try {
            await notificacionInteligenteService.marcarLeida(id);
            setNotificaciones(notificaciones.filter(n => n.id !== id));
            setContador(Math.max(0, contador - 1));

            // Si hay un cliente_id, navegar a la página del cliente
            if (clienteId) {
                setIsOpen(false);
                navigate(`/clientes/${clienteId}`);
            }
        } catch (error) {
            console.error('Error marcando como leída:', error);
        }
    };

    const handleMarcarTodasLeidas = async () => {
        try {
            const ids = notificaciones.map(n => n.id);
            if (ids.length > 0) {
                await notificacionInteligenteService.marcarVariasLeidas(ids);
                setNotificaciones([]);
                setContador(0);
            }
        } catch (error) {
            console.error('Error marcando todas como leídas:', error);
        }
    };

    const handleEliminar = async (id, e) => {
        e.stopPropagation();
        try {
            await notificacionInteligenteService.archivar(id);
            setNotificaciones(notificaciones.filter(n => n.id !== id));
            setContador(Math.max(0, contador - 1));
        } catch (error) {
            console.error('Error archivando notificación:', error);
        }
    };

    // Mapear prioridad a icono y color
    const getPrioridadConfig = (prioridad) => {
        switch (prioridad) {
            case 'CRITICAL':
                return {
                    icono: <AlertCircle size={20} />,
                    colorClasses: 'bg-red-50 border-red-200 text-red-700',
                    iconColor: 'text-red-600'
                };
            case 'HIGH':
                return {
                    icono: <AlertTriangle size={20} />,
                    colorClasses: 'bg-orange-50 border-orange-200 text-orange-700',
                    iconColor: 'text-orange-600'
                };
            case 'MEDIUM':
                return {
                    icono: <Info size={20} />,
                    colorClasses: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                    iconColor: 'text-yellow-600'
                };
            case 'LOW':
                return {
                    icono: <CheckCircle size={20} />,
                    colorClasses: 'bg-green-50 border-green-200 text-green-700',
                    iconColor: 'text-green-600'
                };
            default:
                return {
                    icono: <Info size={20} />,
                    colorClasses: 'bg-blue-50 border-blue-200 text-blue-700',
                    iconColor: 'text-blue-600'
                };
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
        <>
            {/* BOTÓN DE CAMPANA */}
            <button
                ref={buttonRef}
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

            {/* PANEL CON PORTAL */}
            {isOpen && ReactDOM.createPortal(
                <>
                    {/* OVERLAY */}
                    <div 
                        className="fixed inset-0 z-[999998]"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* PANEL */}
                    <div
                        className="fixed w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[999999]"
                        style={{ 
                            top: `${buttonPosition.top}px`,
                            right: `${buttonPosition.right}px`,
                            maxHeight: 'calc(100vh - 6rem)'
                        }}
                    >
                        {/* HEADER */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white sticky top-0 z-10">
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

                        {/* LISTA */}
                        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                    <p>Cargando...</p>
                                </div>
                            ) : notificaciones.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell size={48} className="mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">No tienes notificaciones</p>
                                    <p className="text-sm">Estás al día 🎉</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {notificaciones.map((notif) => {
                                        const config = getPrioridadConfig(notif.prioridad);
                                        return (
                                            <div
                                                key={notif.id}
                                                onClick={() => handleMarcarLeida(notif.id, notif.cliente_id)}
                                                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${config.colorClasses}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`mt-1 flex-shrink-0 ${config.iconColor}`}>
                                                        {config.icono}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-sm text-gray-900 mb-1">
                                                            {notif.titulo}
                                                        </h4>
                                                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                                            {notif.mensaje}
                                                        </p>
                                                        {notif.cliente_nombre && (
                                                            <p className="text-xs text-gray-500 mb-2">
                                                                Cliente: {notif.cliente_nombre}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-gray-400">
                                                                {formatFecha(notif.fecha_creacion)}
                                                            </span>

                                                            <button
                                                                onClick={(e) => handleEliminar(notif.id, e)}
                                                                className="p-1 hover:bg-red-100 rounded transition-colors text-red-500 flex-shrink-0"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </>,
                document.body
            )}
        </>
    );
};

export default NotificationBell;
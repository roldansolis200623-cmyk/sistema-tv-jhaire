import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Ban, PlayCircle, TrendingUp, TrendingDown, AlertCircle, Zap } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const HistorialCliente = ({ clienteId, isOpen, onClose }) => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtro, setFiltro] = useState('todos');

    useEffect(() => {
        if (isOpen && clienteId) {
            cargarHistorial();
        }
    }, [isOpen, clienteId]);

    const cargarHistorial = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log('📱 1. Cargando historial para cliente:', clienteId);
            
            const response = await axios.get(
                `https://sistema-tv-jhaire-production-1248.up.railway.app/api/clientes/${clienteId}/historial-completo`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log('📱 2. Respuesta recibida:', response.data);
            setHistorial(response.data);
        } catch (error) {
            console.error('❌ Error cargando historial:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatearFechaCorta = (fecha) => {
        return new Date(fecha).toLocaleString('es-PE', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const obtenerIcono = (item) => {
        if (item.tipo === 'suspension') {
            return item.fecha_reactivacion ? 
                <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" /> : 
                <Ban className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
        }
        
        if (item.tipo === 'migracion') {
            switch (item.tipo_cambio) {
                case 'SERVICIO':
                    return <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />;
                case 'PRECIO':
                    return item.precio_nuevo > item.precio_anterior ?
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" /> :
                        <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />;
                case 'PLAN':
                case 'SENAL':
                case 'PERFIL_INTERNET':
                    return <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />;
                default:
                    return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />;
            }
        }
        
        return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />;
    };

    const obtenerTitulo = (item) => {
        if (item.tipo === 'suspension') {
            return item.fecha_reactivacion ? 'Reactivado' : 'Suspendido';
        }
        
        if (item.tipo === 'migracion') {
            return item.observaciones || 'Cambio';
        }
        
        return 'Evento';
    };

    const obtenerColorBorde = (item) => {
        if (item.tipo === 'suspension') {
            return item.fecha_reactivacion ? 'border-green-500' : 'border-red-500';
        }
        
        if (item.tipo === 'migracion') {
            switch (item.tipo_cambio) {
                case 'SERVICIO': return 'border-blue-500';
                case 'PRECIO': return item.precio_nuevo > item.precio_anterior ? 'border-green-500' : 'border-orange-500';
                case 'PLAN': return 'border-purple-500';
                case 'SENAL': return 'border-indigo-500';
                case 'PERFIL_INTERNET': return 'border-cyan-500';
                default: return 'border-gray-500';
            }
        }
        
        return 'border-gray-500';
    };

    const historialFiltrado = historial.filter(item => {
        if (filtro === 'todos') return true;
        return item.tipo === (filtro === 'suspensiones' ? 'suspension' : 'migracion');
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col border border-white/10"
            >
                {/* Header - Adaptado móvil */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 sm:p-6 text-white">
                    <div className="flex justify-between items-start sm:items-center mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center flex-shrink-0"
                            >
                                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg sm:text-2xl font-bold truncate">Historial Completo</h2>
                                <p className="text-white/80 text-xs sm:text-sm truncate">Eventos registrados</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-full p-1.5 sm:p-2 transition-colors flex-shrink-0"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </motion.button>
                    </div>
                    
                    {/* Filtros - Adaptados móvil */}
                    <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFiltro('todos')}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                                filtro === 'todos' 
                                    ? 'bg-white text-indigo-600 shadow-lg' 
                                    : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            Todos ({historial.length})
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFiltro('suspensiones')}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                                filtro === 'suspensiones' 
                                    ? 'bg-white text-indigo-600 shadow-lg' 
                                    : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            Suspensiones ({historial.filter(h => h.tipo === 'suspension').length})
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFiltro('migraciones')}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                                filtro === 'migraciones' 
                                    ? 'bg-white text-indigo-600 shadow-lg' 
                                    : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            Migraciones ({historial.filter(h => h.tipo === 'migracion').length})
                        </motion.button>
                    </div>
                </div>

                {/* Contenido - Scroll optimizado */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gray-900">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
                            />
                        </div>
                    ) : historialFiltrado.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 text-gray-400"
                        >
                            <Clock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-600" />
                            <p className="text-sm sm:text-lg">No hay eventos registrados</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-2 sm:space-y-4">
                            <AnimatePresence>
                                {historialFiltrado.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`bg-gray-800/50 backdrop-blur-xl rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 ${obtenerColorBorde(item)} hover:bg-gray-800/70 transition-all hover:shadow-lg`}
                                    >
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <motion.div
                                                whileHover={{ scale: 1.2, rotate: 360 }}
                                                transition={{ duration: 0.3 }}
                                                className="mt-1 flex-shrink-0"
                                            >
                                                {obtenerIcono(item)}
                                            </motion.div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-white mb-1 text-sm sm:text-base truncate">
                                                    {obtenerTitulo(item)}
                                                </h3>
                                                {/* Fecha - Adaptada móvil */}
                                                <p className="text-xs sm:text-sm text-gray-400 mb-2">
                                                    <span className="hidden sm:inline">{formatearFecha(item.fecha_evento)}</span>
                                                    <span className="sm:hidden">{formatearFechaCorta(item.fecha_evento)}</span>
                                                </p>
                                                
                                                {/* Detalles específicos */}
                                                {item.tipo === 'suspension' && (
                                                    <div className="mt-2 space-y-1 text-xs sm:text-sm">
                                                        {item.motivo && (
                                                            <p className="text-gray-300">
                                                                <span className="font-medium text-white">Motivo:</span> {item.motivo}
                                                            </p>
                                                        )}
                                                        {item.observaciones && (
                                                            <p className="text-gray-300 line-clamp-2 sm:line-clamp-none">
                                                                <span className="font-medium text-white">Obs:</span> {item.observaciones}
                                                            </p>
                                                        )}
                                                        {item.fecha_reactivacion && (
                                                            <p className="text-green-400 font-medium">
                                                                ✓ Reactivado el {formatearFechaCorta(item.fecha_reactivacion)}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {item.tipo === 'migracion' && (
                                                    <div className="mt-2 space-y-1 text-xs sm:text-sm">
                                                        {item.motivo_cambio && (
                                                            <p className="text-gray-300 line-clamp-2 sm:line-clamp-none">
                                                                <span className="font-medium text-white">Motivo:</span> {item.motivo_cambio}
                                                            </p>
                                                        )}
                                                        {item.realizado_por && (
                                                            <p className="text-gray-400 text-xs">
                                                                Por: {item.realizado_por}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Footer - Sticky en móvil */}
                <div className="border-t border-white/10 p-3 sm:p-4 bg-gray-800 sticky bottom-0">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg text-sm sm:text-base"
                    >
                        Cerrar
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default HistorialCliente;

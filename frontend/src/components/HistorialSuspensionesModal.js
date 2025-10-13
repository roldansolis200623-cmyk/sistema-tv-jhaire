import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, AlertTriangle, CheckCircle, User, FileText, Calendar } from 'lucide-react';
import clienteService from '../services/clienteService';

const HistorialSuspensionesModal = ({ cliente, onClose }) => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistorial();
    }, []);

    const loadHistorial = async () => {
        try {
            const data = await clienteService.getHistorialSuspensiones(cliente.id);
            setHistorial(data);
        } catch (error) {
            console.error('Error cargando historial:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calcularDuracion = (fechaSuspension, fechaReactivacion) => {
        if (!fechaReactivacion) return 'Actualmente suspendido';
        
        const inicio = new Date(fechaSuspension);
        const fin = new Date(fechaReactivacion);
        const dias = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24));
        
        if (dias === 0) return 'Menos de 1 día';
        if (dias === 1) return '1 día';
        return `${dias} días`;
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                >
                    <div className="bg-gray-900 rounded-xl p-8 max-h-[85vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                                    <Clock className="text-purple-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Historial de Suspensiones</h2>
                                    <p className="text-white/60 text-sm">
                                        {cliente.nombre} {cliente.apellido} - DNI: {cliente.dni}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Estado actual */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/60 text-sm">Estado Actual:</p>
                                    <p className={`text-xl font-bold ${
                                        cliente.estado === 'activo' ? 'text-green-400' :
                                        cliente.estado === 'suspendido' ? 'text-orange-400' :
                                        'text-red-400'
                                    }`}>
                                        {cliente.estado.toUpperCase()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/60 text-sm">Total de Suspensiones:</p>
                                    <p className="text-3xl font-bold text-white">{historial.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-white/60">Cargando historial...</p>
                            </div>
                        )}

                        {/* Historial vacío */}
                        {!loading && historial.length === 0 && (
                            <div className="text-center py-12">
                                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                                <p className="text-xl font-semibold text-white mb-2">Sin suspensiones previas</p>
                                <p className="text-white/60">Este cliente nunca ha sido suspendido</p>
                            </div>
                        )}

                        {/* Timeline de suspensiones */}
                        {!loading && historial.length > 0 && (
                            <div className="space-y-4">
                                {historial.map((registro, index) => (
                                    <motion.div
                                        key={registro.id}
                                        initial={{ x: -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative"
                                    >
                                        {/* Línea vertical del timeline */}
                                        {index !== historial.length - 1 && (
                                            <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-white/20" />
                                        )}

                                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                                            <div className="flex gap-4">
                                                {/* Icono de estado */}
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    registro.fecha_reactivacion 
                                                        ? 'bg-green-500/20 text-green-400' 
                                                        : 'bg-orange-500/20 text-orange-400'
                                                }`}>
                                                    {registro.fecha_reactivacion ? (
                                                        <CheckCircle size={24} />
                                                    ) : (
                                                        <AlertTriangle size={24} />
                                                    )}
                                                </div>

                                                {/* Contenido */}
                                                <div className="flex-1">
                                                    {/* Cabecera */}
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-white mb-1">
                                                                Suspensión #{historial.length - index}
                                                            </h3>
                                                            <p className="text-sm text-white/60 flex items-center gap-2">
                                                                <Calendar size={14} />
                                                                {formatFecha(registro.fecha_suspension)}
                                                            </p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                            registro.fecha_reactivacion
                                                                ? 'bg-green-500/20 text-green-400'
                                                                : 'bg-orange-500/20 text-orange-400'
                                                        }`}>
                                                            {registro.fecha_reactivacion ? 'REACTIVADO' : 'SUSPENDIDO'}
                                                        </span>
                                                    </div>

                                                    {/* Información de suspensión */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div className="bg-white/5 rounded-lg p-3">
                                                            <p className="text-xs text-white/60 mb-1">Motivo:</p>
                                                            <p className="text-white font-semibold flex items-center gap-2">
                                                                <AlertTriangle size={14} />
                                                                {registro.motivo}
                                                            </p>
                                                        </div>
                                                        <div className="bg-white/5 rounded-lg p-3">
                                                            <p className="text-xs text-white/60 mb-1">Suspendido por:</p>
                                                            <p className="text-white font-semibold flex items-center gap-2">
                                                                <User size={14} />
                                                                {registro.suspendido_por || 'Administrador'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Observaciones */}
                                                    {registro.observaciones && (
                                                        <div className="bg-white/5 rounded-lg p-3 mb-4">
                                                            <p className="text-xs text-white/60 mb-1 flex items-center gap-2">
                                                                <FileText size={14} />
                                                                Observaciones:
                                                            </p>
                                                            <p className="text-white text-sm">{registro.observaciones}</p>
                                                        </div>
                                                    )}

                                                    {/* Información de reactivación */}
                                                    {registro.fecha_reactivacion && (
                                                        <div className="border-t border-white/10 pt-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="bg-green-500/10 rounded-lg p-3">
                                                                    <p className="text-xs text-green-400/80 mb-1">Fecha Reactivación:</p>
                                                                    <p className="text-white font-semibold flex items-center gap-2">
                                                                        <Calendar size={14} />
                                                                        {formatFecha(registro.fecha_reactivacion)}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-green-500/10 rounded-lg p-3">
                                                                    <p className="text-xs text-green-400/80 mb-1">Duración:</p>
                                                                    <p className="text-white font-semibold flex items-center gap-2">
                                                                        <Clock size={14} />
                                                                        {calcularDuracion(registro.fecha_suspension, registro.fecha_reactivacion)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {registro.reactivado_por && (
                                                                <div className="bg-green-500/10 rounded-lg p-3 mt-4">
                                                                    <p className="text-xs text-green-400/80 mb-1">Reactivado por:</p>
                                                                    <p className="text-white font-semibold flex items-center gap-2">
                                                                        <User size={14} />
                                                                        {registro.reactivado_por}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Botón cerrar */}
                        <div className="mt-6">
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-white/10 backdrop-blur-xl border border-white/20 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                            >
                                <X size={20} />
                                Cerrar
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default HistorialSuspensionesModal;
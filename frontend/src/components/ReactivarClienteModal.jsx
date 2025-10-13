import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, RefreshCw } from 'lucide-react';
import clienteService from '../services/clienteService';

const ReactivarClienteModal = ({ cliente, onClose, onSuccess }) => {
    const [reactivadoPor, setReactivadoPor] = useState('Administrador');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        try {
            await clienteService.reactivar(cliente.id, reactivadoPor);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al reactivar cliente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-1 rounded-2xl max-w-xl w-full"
                >
                    <div className="bg-gray-900 rounded-xl p-8">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <CheckCircle className="text-green-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Reactivar Cliente</h2>
                                    <p className="text-white/60 text-sm">
                                        {cliente.nombre} {cliente.apellido}
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

                        {/* Información de suspensión */}
                        {cliente.fecha_suspension && (
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-6">
                                <h3 className="text-white font-semibold mb-3">Información de Suspensión:</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-white/60">Fecha:</span>
                                        <span className="text-white ml-2">
                                            {new Date(cliente.fecha_suspension).toLocaleDateString('es-PE')}
                                        </span>
                                    </div>
                                    {cliente.motivo_suspension && (
                                        <div>
                                            <span className="text-white/60">Motivo:</span>
                                            <span className="text-white ml-2">{cliente.motivo_suspension}</span>
                                        </div>
                                    )}
                                    {cliente.observaciones_suspension && (
                                        <div>
                                            <span className="text-white/60">Observaciones:</span>
                                            <p className="text-white mt-1">{cliente.observaciones_suspension}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-white/90 text-sm font-semibold mb-2">
                                    Reactivado por
                                </label>
                                <input
                                    type="text"
                                    value={reactivadoPor}
                                    onChange={(e) => setReactivadoPor(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Botones */}
                            <div className="flex gap-4 pt-4">
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Reactivando...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={20} />
                                            Confirmar Reactivación
                                        </>
                                    )}
                                </motion.button>
                                
                                <motion.button
                                    type="button"
                                    onClick={onClose}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <X size={20} />
                                    Cancelar
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReactivarClienteModal;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Clock } from 'lucide-react';
import clienteService from '../services/clienteService';

const SuspenderClienteModal = ({ cliente, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        motivo: '',
        observaciones: '',
        suspendido_por: 'Administrador'
    });
    const [loading, setLoading] = useState(false);

    // Motivos predefinidos como en tu Java Swing
    const motivosPredefinidos = [
        'No paga',
        'Mudanza',
        'Problemas técnicos',
        'Servicio deficiente',
        'Solicitud del cliente',
        'Otro'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.motivo) {
            alert('Por favor selecciona un motivo');
            return;
        }

        setLoading(true);
        try {
            await clienteService.suspender(cliente.id, formData);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al suspender cliente');
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
                    className="bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 p-1 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                >
                    <div className="bg-gray-900 rounded-xl p-8 max-h-[85vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="text-red-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Suspender Cliente</h2>
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

                        {/* Información del cliente */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-white/60">DNI:</span>
                                    <span className="text-white ml-2 font-semibold">{cliente.dni}</span>
                                </div>
                                <div>
                                    <span className="text-white/60">Plan:</span>
                                    <span className="text-white ml-2 font-semibold">{cliente.plan}</span>
                                </div>
                                <div>
                                    <span className="text-white/60">Precio:</span>
                                    <span className="text-white ml-2 font-semibold">S/ {cliente.precio_mensual}</span>
                                </div>
                                <div>
                                    <span className="text-white/60">Meses deuda:</span>
                                    <span className="text-red-400 ml-2 font-bold">{cliente.meses_deuda}</span>
                                </div>
                            </div>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Motivo Predefinido */}
                            <div>
                                <label className="block text-white/90 text-sm font-semibold mb-3 flex items-center gap-2">
                                    <Clock size={18} />
                                    Motivo de Suspensión <span className="text-red-400">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {motivosPredefinidos.map((motivo) => (
                                        <motion.button
                                            key={motivo}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, motivo })}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                                                formData.motivo === motivo
                                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
                                                    : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                                            }`}
                                        >
                                            {motivo}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label className="block text-white/90 text-sm font-semibold mb-2">
                                    Observaciones Adicionales
                                </label>
                                <textarea
                                    value={formData.observaciones}
                                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                    placeholder="Escribe detalles adicionales sobre la suspensión..."
                                    rows="4"
                                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                                />
                            </div>

                            {/* Suspendido por */}
                            <div>
                                <label className="block text-white/90 text-sm font-semibold mb-2">
                                    Suspendido por
                                </label>
                                <input
                                    type="text"
                                    value={formData.suspendido_por}
                                    onChange={(e) => setFormData({ ...formData, suspendido_por: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Botones */}
                            <div className="flex gap-4 pt-4">
                                <motion.button
                                    type="submit"
                                    disabled={loading || !formData.motivo}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Suspendiendo...
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle size={20} />
                                            Confirmar Suspensión
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

export default SuspenderClienteModal;
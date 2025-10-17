import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Clock } from 'lucide-react';
import clienteService from '../services/clienteService';

const SuspenderClienteModal = ({ cliente, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ motivo: '', observaciones: '', suspendido_por: 'Administrador' });
    const [loading, setLoading] = useState(false);

    const motivosPredefinidos = ['No paga', 'Mudanza', 'Problemas técnicos', 'Servicio deficiente', 'Solicitud del cliente', 'Otro'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.motivo) { alert('Selecciona un motivo'); return; }
        setLoading(true);
        try {
            await clienteService.suspender(cliente.id, formData);
            onSuccess();
            onClose();
        } catch (error) {
            alert('Error al suspender');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 p-0.5 sm:p-1 rounded-2xl w-full max-w-2xl">
                <div className="bg-gray-900 rounded-2xl p-4 sm:p-8 max-h-[95vh] overflow-y-auto">
                    <div className="flex justify-between items-start mb-4 gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <AlertTriangle className="text-red-400 w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-full p-2" />
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg sm:text-2xl font-bold text-white truncate">Suspender Cliente</h2>
                                <p className="text-white/60 text-xs sm:text-sm truncate">{cliente.nombre} {cliente.apellido}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/60 hover:text-white p-1"><X className="w-5 h-5 sm:w-6 sm:h-6" /></button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 mb-4">
                        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                            <div><span className="text-white/60">DNI:</span><span className="text-white ml-1 font-semibold">{cliente.dni}</span></div>
                            <div><span className="text-white/60">Plan:</span><span className="text-white ml-1 font-semibold">{cliente.plan}</span></div>
                            <div><span className="text-white/60">Precio:</span><span className="text-white ml-1 font-semibold">S/ {cliente.precio_mensual}</span></div>
                            <div><span className="text-white/60">Deuda:</span><span className="text-red-400 ml-1 font-bold">{cliente.meses_deuda}</span></div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-white/90 text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Motivo *
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {motivosPredefinidos.map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, motivo: m })}
                                        className={`px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm ${formData.motivo === m ? 'bg-red-500 text-white' : 'bg-white/10 text-white/70 border border-white/20'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-white/90 text-xs sm:text-sm font-semibold mb-2">Observaciones</label>
                            <textarea
                                value={formData.observaciones}
                                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                rows="3"
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-red-500 text-sm"
                                placeholder="Detalles..."
                            />
                        </div>

                        <div>
                            <label className="block text-white/90 text-xs sm:text-sm font-semibold mb-2">Suspendido por</label>
                            <input
                                type="text"
                                value={formData.suspendido_por}
                                onChange={(e) => setFormData({ ...formData, suspendido_por: e.target.value })}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-red-500 text-sm"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
                            <button
                                type="submit"
                                disabled={loading || !formData.motivo}
                                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span className="hidden sm:inline">...</span>
                                </> : <>
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="hidden sm:inline">Confirmar</span>
                                    <span className="sm:hidden">Suspender</span>
                                </>}
                            </button>
                            <button type="button" onClick={onClose} className="flex-1 bg-white/10 border border-white/20 text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                                <X className="w-4 h-4" /> Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default SuspenderClienteModal;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, CheckCircle } from 'lucide-react';
import { mensajesWhatsApp, enviarWhatsApp, obtenerMensajeAutomatico } from '../utils/whatsappUtils.mjs';

const WhatsAppModal = ({ cliente, onClose }) => {
    const [tipoMensaje, setTipoMensaje] = useState('auto');
    const [mensajePersonalizado, setMensajePersonalizado] = useState('');

    const obtenerMensaje = () => {
        const mesesDeuda = cliente.meses_deuda || 0;
        const totalDeuda = mesesDeuda * parseFloat(cliente.precio_mensual || 0);

        switch (tipoMensaje) {
            case 'auto':
                return obtenerMensajeAutomatico(cliente);
            case 'recordatorio':
                return mensajesWhatsApp.recordatorioPago(cliente, cliente.precio_mensual);
            case 'deuda':
                return mensajesWhatsApp.recordatorioDeuda(cliente, mesesDeuda, totalDeuda);
            case 'bienvenida':
                return mensajesWhatsApp.bienvenida(cliente);
            case 'nuevo':
                return mensajesWhatsApp.nuevoCliente(cliente);
            case 'reactivacion':
                return mensajesWhatsApp.reactivacion(cliente);
            case 'suspension':
                return mensajesWhatsApp.suspension(cliente);
            case 'personalizado':
                return mensajesWhatsApp.personalizado(cliente, mensajePersonalizado);
            default:
                return obtenerMensajeAutomatico(cliente);
        }
    };

    const handleEnviar = () => {
        const mensaje = obtenerMensaje();
        enviarWhatsApp(cliente.telefono, mensaje);
        onClose();
    };

    const tiposMensaje = [
        { id: 'auto', label: '🤖 Automático', desc: 'Mensaje según estado del cliente' },
        { id: 'recordatorio', label: '💰 Recordatorio Amigable', desc: 'Recordar pago mensual (día 28)' },
        { id: 'deuda', label: '⚠️ Recordatorio Final', desc: 'Notificar deuda urgente (día 30)' },
        { id: 'bienvenida', label: '👋 Saludo Mensual', desc: 'Mensaje inicio de mes' },
        { id: 'nuevo', label: '🆕 Nuevo Cliente', desc: 'Bienvenida cliente nuevo' },
        { id: 'reactivacion', label: '✅ Reactivación', desc: 'Confirmar reactivación servicio' },
        { id: 'suspension', label: '🔴 Suspensión', desc: 'Notificar suspensión' },
        { id: 'personalizado', label: '✏️ Personalizado', desc: 'Escribe tu mensaje' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                            <MessageSquare className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Enviar WhatsApp</h3>
                            <p className="text-white/80 text-sm">
                                {cliente.nombre} {cliente.apellido} • {cliente.telefono}
                            </p>
                        </div>
                    </div>
                    <motion.button
                        onClick={onClose}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10"
                    >
                        <X size={24} />
                    </motion.button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Tipo de Mensaje */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                            Selecciona el tipo de mensaje:
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {tiposMensaje.map((tipo) => (
                                <motion.button
                                    key={tipo.id}
                                    onClick={() => setTipoMensaje(tipo.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                                        tipoMensaje === tipo.id
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                            : 'border-gray-200 dark:border-slate-600 hover:border-green-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                            {tipo.label}
                                        </span>
                                        {tipoMensaje === tipo.id && (
                                            <CheckCircle size={18} className="text-green-600" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{tipo.desc}</p>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Mensaje Personalizado */}
                    {tipoMensaje === 'personalizado' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6"
                        >
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Escribe tu mensaje:
                            </label>
                            <textarea
                                value={mensajePersonalizado}
                                onChange={(e) => setMensajePersonalizado(e.target.value)}
                                rows="6"
                                placeholder="Escribe tu mensaje personalizado aquí..."
                                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Los medios de pago se agregarán automáticamente al final del mensaje
                            </p>
                        </motion.div>
                    )}

                    {/* Vista Previa */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Vista previa del mensaje:
                        </label>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 border border-green-200 dark:border-slate-600 rounded-xl p-4 max-h-80 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-sans leading-relaxed">
                                {obtenerMensaje()}
                            </pre>
                        </div>
                    </div>

                    {/* Info del Cliente */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                                <span className="ml-2 font-semibold text-gray-900 dark:text-white capitalize">
                                    {cliente.estado || 'Activo'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Meses Deuda:</span>
                                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                    {cliente.meses_deuda || 0}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                    S/ {parseFloat(cliente.precio_mensual || 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-slate-900 px-6 py-4 flex gap-3">
                    <motion.button
                        onClick={onClose}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-slate-600"
                    >
                        Cancelar
                    </motion.button>
                    <motion.button
                        onClick={handleEnviar}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Send size={20} />
                        Enviar por WhatsApp
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default WhatsAppModal;
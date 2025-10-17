import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, MessageSquare, CheckCircle } from 'lucide-react';
import { mensajesWhatsApp, enviarWhatsApp, obtenerMensajeAutomatico } from '../utils/whatsappUtils.mjs';

const WhatsAppModal = ({ cliente, onClose }) => {
    const [tipoMensaje, setTipoMensaje] = useState('auto');
    const [mensajePersonalizado, setMensajePersonalizado] = useState('');

    const obtenerMensaje = () => {
        const mesesDeuda = cliente.meses_deuda || 0;
        const totalDeuda = mesesDeuda * parseFloat(cliente.precio_mensual || 0);
        switch (tipoMensaje) {
            case 'auto': return obtenerMensajeAutomatico(cliente);
            case 'recordatorio': return mensajesWhatsApp.recordatorioPago(cliente, cliente.precio_mensual);
            case 'deuda': return mensajesWhatsApp.recordatorioDeuda(cliente, mesesDeuda, totalDeuda);
            case 'bienvenida': return mensajesWhatsApp.bienvenida(cliente);
            case 'nuevo': return mensajesWhatsApp.nuevoCliente(cliente);
            case 'reactivacion': return mensajesWhatsApp.reactivacion(cliente);
            case 'suspension': return mensajesWhatsApp.suspension(cliente);
            case 'personalizado': return mensajesWhatsApp.personalizado(cliente, mensajePersonalizado);
            default: return obtenerMensajeAutomatico(cliente);
        }
    };

    const handleEnviar = () => {
        enviarWhatsApp(cliente.telefono, obtenerMensaje());
        onClose();
    };

    const tiposMensaje = [
        { id: 'auto', label: '🤖 Auto', desc: 'Según estado' },
        { id: 'recordatorio', label: '💰 Recordatorio', desc: 'Pago mensual' },
        { id: 'deuda', label: '⚠️ Urgente', desc: 'Deuda' },
        { id: 'bienvenida', label: '👋 Saludo', desc: 'Inicio mes' },
        { id: 'nuevo', label: '🆕 Nuevo', desc: 'Bienvenida' },
        { id: 'reactivacion', label: '✅ Reactivar', desc: 'Confirmar' },
        { id: 'suspension', label: '🔴 Suspender', desc: 'Notificar' },
        { id: 'personalizado', label: '✏️ Custom', desc: 'Tu mensaje' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl"
            >
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0 rounded-t-2xl sm:rounded-t-3xl">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <MessageSquare className="text-white w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full p-2" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold text-white truncate">WhatsApp</h3>
                            <p className="text-white/80 text-xs sm:text-sm truncate">{cliente.nombre} • {cliente.telefono}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 sm:w-6 sm:h-6" /></button>
                </div>

                <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                    <div className="mb-4">
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tipo de mensaje:</label>
                        <div className="grid grid-cols-2 gap-2">
                            {tiposMensaje.map((tipo) => (
                                <button
                                    key={tipo.id}
                                    onClick={() => setTipoMensaje(tipo.id)}
                                    className={`p-2 rounded-lg border-2 text-left ${tipoMensaje === tipo.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-slate-600'}`}
                                >
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">{tipo.label}</span>
                                        {tipoMensaje === tipo.id && <CheckCircle className="w-4 h-4 text-green-600" />}
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 truncate">{tipo.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {tipoMensaje === 'personalizado' && (
                        <div className="mb-4">
                            <label className="block text-xs sm:text-sm font-bold mb-2">Tu mensaje:</label>
                            <textarea
                                value={mensajePersonalizado}
                                onChange={(e) => setMensajePersonalizado(e.target.value)}
                                rows="4"
                                placeholder="Escribe aquí..."
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-xs sm:text-sm font-bold mb-2">Vista previa:</label>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 border rounded-lg p-3 max-h-60 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-sans">{obtenerMensaje()}</pre>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border rounded-lg p-3">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div><span className="text-gray-600">Estado:</span><span className="ml-1 font-semibold">{cliente.estado || 'Activo'}</span></div>
                            <div><span className="text-gray-600">Deuda:</span><span className="ml-1 font-semibold">{cliente.meses_deuda || 0}</span></div>
                            <div><span className="text-gray-600">Plan:</span><span className="ml-1 font-semibold">S/ {parseFloat(cliente.precio_mensual || 0).toFixed(2)}</span></div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-900 px-4 sm:px-6 py-3 flex gap-2 flex-shrink-0 rounded-b-2xl sm:rounded-b-3xl">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold text-sm">Cancelar</button>
                    <button onClick={handleEnviar} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 text-sm">
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Enviar</span>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default WhatsAppModal;

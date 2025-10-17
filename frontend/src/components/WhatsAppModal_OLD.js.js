import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';

const WhatsAppModal = ({ cliente, onClose }) => {
    const [mensaje, setMensaje] = useState('');
    const [enviando, setEnviando] = useState(false);

    const enviarRecordatorio = async () => {
        setEnviando(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://sistema-tv-jhaire-production-1248.up.railway.app/api/whatsapp/recordatorio/${cliente.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                alert('Recordatorio enviado exitosamente');
                onClose();
            } else {
                alert('Error al enviar recordatorio');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al enviar recordatorio');
        } finally {
            setEnviando(false);
        }
    };

    const enviarPersonalizado = async () => {
        if (!mensaje.trim()) {
            alert('Escribe un mensaje');
            return;
        }

        setEnviando(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://sistema-tv-jhaire-production-1248.up.railway.app/api/whatsapp/mensaje-personalizado', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ clienteId: cliente.id, mensaje })
            });
            
            if (response.ok) {
                alert('Mensaje enviado exitosamente');
                onClose();
            } else {
                alert('Error al enviar mensaje');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al enviar mensaje');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold" style={{ color: '#364254' }}>
                        Enviar WhatsApp a {cliente.nombre}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={enviarRecordatorio}
                        disabled={enviando}
                        className="w-full py-3 rounded-lg font-semibold text-white disabled:opacity-50"
                        style={{ background: '#4a5f7f' }}
                    >
                        {enviando ? 'Enviando...' : 'Enviar Recordatorio de Pago'}
                    </button>

                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#364254' }}>
                            O escribe un mensaje personalizado:
                        </label>
                        <textarea
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            placeholder="Escribe tu mensaje aquí..."
                            rows={4}
                            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2"
                            style={{ borderColor: '#4a5f7f' }}
                        />
                    </div>

                    <button
                        onClick={enviarPersonalizado}
                        disabled={enviando}
                        className="w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{ background: '#25D366' }}
                    >
                        <Send size={20} />
                        {enviando ? 'Enviando...' : 'Enviar Mensaje Personalizado'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default WhatsAppModal;
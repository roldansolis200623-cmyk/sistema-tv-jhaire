import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, User, Phone, MapPin, Calendar, DollarSign, 
    Wifi, CreditCard, AlertCircle, Edit, Ban, 
    PlayCircle, MessageCircle, FileText, Clock,
    TrendingDown, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import pagoService from '../services/pagoService';

const ClienteDetallePanel = ({ cliente, onClose, onSuspender, onReactivar, onWhatsApp }) => {
    const [pagosRecientes, setPagosRecientes] = useState([]);
    const [loadingPagos, setLoadingPagos] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (cliente) {
            cargarPagosRecientes();
        }
    }, [cliente]);

    const cargarPagosRecientes = async () => {
        try {
            setLoadingPagos(true);
            const pagos = await pagoService.getPorCliente(cliente.id);
            setPagosRecientes(pagos.slice(0, 5)); // Solo los últimos 5
        } catch (error) {
            console.error('Error cargando pagos:', error);
        } finally {
            setLoadingPagos(false);
        }
    };

    if (!cliente) return null;

    const deudaTotal = (cliente.meses_deuda || 0) * (cliente.precio_mensual || 0);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-0 h-full w-full md:w-[600px] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 shadow-2xl overflow-y-auto"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 border-b border-white/10">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                                    <User className="text-white" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {cliente.nombre} {cliente.apellido}
                                    </h2>
                                    <p className="text-white/70 text-sm">DNI: {cliente.dni}</p>
                                </div>
                            </div>
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-white/80 hover:text-white transition p-2 rounded-lg hover:bg-white/10"
                            >
                                <X size={24} />
                            </motion.button>
                        </div>

                        {/* Estado Badge */}
                        <div className="mt-4">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                                cliente.estado === 'activo' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                                cliente.estado === 'suspendido' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50' :
                                'bg-red-500/20 text-red-300 border border-red-500/50'
                            }`}>
                                {cliente.estado === 'activo' ? <CheckCircle size={16} /> :
                                 cliente.estado === 'suspendido' ? <AlertCircle size={16} /> :
                                 <Ban size={16} />}
                                {cliente.estado.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-6 space-y-6">
                        {/* Información Personal */}
                        <section className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <User size={20} />
                                Información Personal
                            </h3>
                            <div className="space-y-3">
                                <InfoRow icon={<Phone size={16} />} label="Teléfono" value={cliente.telefono || 'No registrado'} />
                                <InfoRow icon={<MapPin size={16} />} label="Dirección" value={cliente.direccion || 'No registrada'} />
                                <InfoRow icon={<Calendar size={16} />} label="Fecha Instalación" value={cliente.fecha_instalacion ? new Date(cliente.fecha_instalacion).toLocaleDateString('es-PE') : 'N/A'} />
                            </div>
                        </section>

                        {/* Información del Servicio */}
                        <section className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Wifi size={20} />
                                Servicio Contratado
                            </h3>
                            <div className="space-y-3">
                                <InfoRow icon={<Wifi size={16} />} label="Tipo Servicio" value={cliente.tipo_servicio || 'No especificado'} />
                                <InfoRow icon={<FileText size={16} />} label="Plan" value={cliente.plan || 'N/A'} />
                                <InfoRow icon={<DollarSign size={16} />} label="Precio Mensual" value={`S/ ${cliente.precio_mensual || 0}`} highlight />
                                {cliente.tipo_senal && (
                                    <InfoRow icon={<Wifi size={16} />} label="Tipo Señal" value={cliente.tipo_senal} />
                                )}
                            </div>
                        </section>

                        {/* Estado Financiero */}
                        <section className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <CreditCard size={20} />
                                Estado Financiero
                            </h3>
                            <div className="space-y-3">
                                <InfoRow 
                                    icon={<TrendingDown size={16} />} 
                                    label="Meses de Deuda" 
                                    value={`${cliente.meses_deuda || 0} mes(es)`}
                                    danger={cliente.meses_deuda > 0}
                                />
                                <InfoRow 
                                    icon={<DollarSign size={16} />} 
                                    label="Deuda Total" 
                                    value={`S/ ${deudaTotal.toFixed(2)}`}
                                    danger={deudaTotal > 0}
                                    highlight
                                />
                            </div>
                        </section>

                        {/* Pagos Recientes */}
                        <section className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Clock size={20} />
                                Últimos Pagos
                            </h3>
                            {loadingPagos ? (
                                <div className="text-center py-4">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto"
                                    />
                                </div>
                            ) : pagosRecientes.length === 0 ? (
                                <p className="text-white/60 text-sm text-center py-4">No hay pagos registrados</p>
                            ) : (
                                <div className="space-y-2">
                                    {pagosRecientes.map((pago, index) => (
                                        <motion.div
                                            key={pago.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white/5 rounded-xl p-3 flex justify-between items-center hover:bg-white/10 transition-all"
                                        >
                                            <div>
                                                <p className="text-white/80 text-sm">
                                                    {new Date(pago.fecha_pago).toLocaleDateString('es-PE')}
                                                </p>
                                                <p className="text-white/60 text-xs">
                                                    {pago.meses_detalle || `${pago.meses_pagados || 1} mes(es)`}
                                                </p>
                                            </div>
                                            <span className="text-green-400 font-bold">
                                                S/ {parseFloat(pago.monto).toFixed(2)}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Observaciones */}
                        {cliente.observaciones && (
                            <section className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5">
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <FileText size={20} />
                                    Observaciones
                                </h3>
                                <p className="text-white/80 text-sm">{cliente.observaciones}</p>
                            </section>
                        )}

                        {/* Botones de Acción */}
                        <section className="space-y-3">
                            <motion.button
                                onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
                            >
                                <Edit size={20} />
                                Editar Cliente
                            </motion.button>

                            {cliente.estado === 'activo' ? (
                                <motion.button
                                    onClick={() => {
                                        onClose();
                                        onSuspender(cliente);
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
                                >
                                    <Ban size={20} />
                                    Suspender Cliente
                                </motion.button>
                            ) : cliente.estado === 'suspendido' ? (
                                <motion.button
                                    onClick={() => {
                                        onClose();
                                        onReactivar(cliente);
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
                                >
                                    <PlayCircle size={20} />
                                    Reactivar Cliente
                                </motion.button>
                            ) : null}

                            <motion.button
                                onClick={() => navigate('/pagos', { state: { clienteId: cliente.id } })}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
                            >
                                <DollarSign size={20} />
                                Registrar Pago
                            </motion.button>

                            <motion.button
                                onClick={() => {
                                    onClose();
                                    onWhatsApp(cliente);
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
                            >
                                <MessageCircle size={20} />
                                Enviar WhatsApp
                            </motion.button>

                            <motion.button
                                onClick={() => navigate(`/historial-pagos/${cliente.id}`)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
                            >
                                <FileText size={20} />
                                Ver Historial Completo
                            </motion.button>
                        </section>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const InfoRow = ({ icon, label, value, highlight, danger }) => (
    <div className="flex items-center justify-between">
        <span className="text-white/70 text-sm flex items-center gap-2">
            {icon}
            {label}
        </span>
        <span className={`font-semibold ${
            danger ? 'text-red-400' :
            highlight ? 'text-green-400' :
            'text-white'
        }`}>
            {value}
        </span>
    </div>
);

export default ClienteDetallePanel;
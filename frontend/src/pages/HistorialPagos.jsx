import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, DollarSign, Calendar, CreditCard, User,
    Phone, MapPin, Wifi, TrendingUp, FileText, Clock,
    Printer, Download, CheckCircle, X
} from 'lucide-react';
import pagoService from '../services/pagoService';
import { clienteService } from '../services/api';
import ReciboTemplate from '../components/ReciboTemplate';
import { generarReciboPDF, imprimirRecibo } from '../utils/reciboGenerator';

const HistorialPagos = () => {
    const { clienteId } = useParams();
    const navigate = useNavigate();
    const [cliente, setCliente] = useState(null);
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 🆕 Estados para el modal de recibo
    const [showReciboModal, setShowReciboModal] = useState(false);
    const [pagoSeleccionado, setPagoSeleccionado] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, [clienteId]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [clienteData, pagosData] = await Promise.all([
                clienteService.getById(clienteId),
                pagoService.getPorCliente(clienteId)
            ]);
            setCliente(clienteData);
            setPagos(pagosData);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    // 🆕 Función para abrir modal de recibo
    const handleVerRecibo = (pago) => {
        const pagoCompleto = {
            id: pago.id,
            monto: pago.monto,
            fecha: pago.fecha_pago,
            metodo_pago: pago.metodo_pago,
            observaciones: pago.observaciones,
            numero_recibo: pago.numero_recibo,
            meses_pagados: pago.meses_pagados
        };
        
        setPagoSeleccionado(pagoCompleto);
        setShowReciboModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.5, 1] }}
                    transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
                    className="text-8xl"
                >
                    💰
                </motion.div>
            </div>
        );
    }

    const totalPagado = pagos.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);
    const ultimoPago = pagos.length > 0 ? pagos[0] : null;
    const promedioMensual = pagos.length > 0 ? (totalPagado / pagos.length).toFixed(2) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Partículas flotantes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full opacity-20"
                        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, Math.random() * 20 - 10, 0],
                            scale: [1, 1.5, 1],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <motion.header
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8"
                >
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
                            >
                                <FileText className="text-white" size={24} />
                            </motion.div>
                            <div>
                                <h1 className="text-4xl font-bold text-white">Historial de Pagos</h1>
                                <p className="text-white/60 text-sm">Cliente: {cliente?.nombre} {cliente?.apellido}</p>
                            </div>
                        </div>
                        <motion.button
                            onClick={() => navigate('/clientes')}
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all font-semibold"
                        >
                            <ArrowLeft size={20} />
                            Volver
                        </motion.button>
                    </div>
                </motion.header>

                {/* Información del Cliente */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-8"
                >
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <User size={24} />
                        Información del Cliente
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <InfoCard icon={<User size={20} />} label="DNI" value={cliente?.dni} />
                        <InfoCard icon={<Phone size={20} />} label="Teléfono" value={cliente?.telefono || 'N/A'} />
                        <InfoCard icon={<DollarSign size={20} />} label="Plan Mensual" value={`S/ ${parseFloat(cliente?.precio_mensual || 0).toFixed(2)}`} />
                        <InfoCard icon={<MapPin size={20} />} label="Dirección" value={cliente?.direccion || 'N/A'} />
                    </div>
                </motion.div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<FileText />}
                        title="Total de Pagos"
                        value={pagos.length}
                        gradient="from-blue-500 to-cyan-500"
                        delay={0}
                    />
                    <StatCard
                        icon={<DollarSign />}
                        title="Total Pagado"
                        value={totalPagado.toFixed(2)}
                        prefix="S/ "
                        gradient="from-green-500 to-emerald-500"
                        delay={0.1}
                    />
                    <StatCard
                        icon={<TrendingUp />}
                        title="Promedio por Pago"
                        value={promedioMensual}
                        prefix="S/ "
                        gradient="from-orange-500 to-red-500"
                        delay={0.2}
                    />
                    <StatCard
                        icon={<Clock />}
                        title="Último Pago"
                        value={ultimoPago ? new Date(ultimoPago.fecha_pago).toLocaleDateString('es-PE') : 'Sin pagos'}
                        gradient="from-purple-500 to-pink-500"
                        delay={0.3}
                        small
                    />
                </div>

                {/* Tabla de Pagos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                        <h3 className="text-xl font-bold text-white">Historial Completo de Pagos</h3>
                    </div>

                    {pagos.length === 0 ? (
                        <div className="p-12 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center"
                            >
                                <FileText className="text-white/40" size={48} />
                            </motion.div>
                            <p className="text-white/60 text-lg">Este cliente aún no tiene pagos registrados</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">#</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Monto</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Meses</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">N° Recibo</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Método</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Observaciones</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {pagos.map((pago, index) => (
                                        <motion.tr
                                            key={pago.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                            className="transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 font-bold text-sm">
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="text-purple-400" size={16} />
                                                    <span className="text-sm text-white/80">
                                                        {new Date(pago.fecha_pago).toLocaleDateString('es-PE')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <motion.span
                                                    whileHover={{ scale: 1.1 }}
                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-green-500/20 text-green-300 font-bold text-sm"
                                                >
                                                    <DollarSign size={14} />
                                                    S/ {parseFloat(pago.monto).toFixed(2)}
                                                </motion.span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-semibold text-xs">
                                                    {pago.meses_detalle || `${pago.meses_pagados || 1} mes(es)`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80 font-mono">
                                                {pago.numero_recibo || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="text-cyan-400" size={16} />
                                                    <span className="text-sm text-white/80">
                                                        {pago.metodo_pago}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white/70 max-w-xs truncate">
                                                {pago.observaciones || '-'}
                                            </td>
                                            {/* 🆕 COLUMNA DE ACCIONES */}
                                            <td className="px-6 py-4 text-center">
                                                <motion.button
                                                    onClick={() => handleVerRecibo(pago)}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg font-semibold transition-all shadow-lg"
                                                    title="Ver Recibo"
                                                >
                                                    <FileText size={16} />
                                                    Ver Recibo
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* 🆕 MODAL DE RECIBO */}
            <AnimatePresence>
                {showReciboModal && pagoSeleccionado && cliente && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-xl w-full shadow-2xl border border-indigo-200"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                        Recibo de Pago
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        N° {pagoSeleccionado.numero_recibo || `#${pagoSeleccionado.id}`}
                                    </p>
                                </div>
                                <motion.button
                                    onClick={() => {
                                        setShowReciboModal(false);
                                        setPagoSeleccionado(null);
                                    }}
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>

                            {/* Detalles del Pago */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 mb-6 border border-indigo-100 dark:border-slate-600">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cliente</p>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {cliente.nombre} {cliente.apellido}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">DNI</p>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {cliente.dni}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Monto</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            S/ {parseFloat(pagoSeleccionado.monto).toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Fecha</p>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {new Date(pagoSeleccionado.fecha).toLocaleDateString('es-PE', { 
                                                day: '2-digit', 
                                                month: 'long', 
                                                year: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Método de Pago</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {pagoSeleccionado.metodo_pago}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Meses Pagados</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {pagoSeleccionado.meses_pagados || 1} {pagoSeleccionado.meses_pagados === 1 ? 'mes' : 'meses'}
                                        </p>
                                    </div>
                                </div>

                                {pagoSeleccionado.observaciones && (
                                    <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-slate-600">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Observaciones</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {pagoSeleccionado.observaciones}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Check de confirmación */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="flex items-center justify-center gap-2 mb-6 text-green-600"
                            >
                                <CheckCircle size={24} />
                                <span className="font-semibold">Pago Verificado</span>
                            </motion.div>

                            {/* Botones de Acción */}
                            <div className="space-y-3">
                                <motion.button
                                    onClick={() => {
                                        imprimirRecibo(pagoSeleccionado, cliente);
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition-all"
                                >
                                    <Printer size={20} />
                                    <span>Imprimir Recibo</span>
                                </motion.button>

                                <motion.button
                                    onClick={() => {
                                        generarReciboPDF(pagoSeleccionado, cliente);
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-lg transition-all"
                                >
                                    <Download size={20} />
                                    <span>Descargar PDF</span>
                                </motion.button>

                                <motion.button
                                    onClick={() => {
                                        setShowReciboModal(false);
                                        setPagoSeleccionado(null);
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition-all"
                                >
                                    Cerrar
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Recibo oculto para generar PDF/Impresión */}
                        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                            <ReciboTemplate pago={pagoSeleccionado} cliente={cliente} />
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const InfoCard = ({ icon, label, value }) => (
    <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
            {icon}
            {label}
        </div>
        <p className="text-white font-semibold truncate">{value}</p>
    </div>
);

const StatCard = ({ icon, title, value, prefix = '', gradient, delay, small }) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay, type: 'spring', stiffness: 200 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 relative overflow-hidden group"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        
        <div className="relative z-10">
            <motion.div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${gradient} text-white shadow-lg`}
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, delay }}
            >
                {React.cloneElement(icon, { size: 28 })}
            </motion.div>
            
            <p className="text-sm font-semibold mb-2 text-white/80 uppercase tracking-wide">
                {title}
            </p>
            
            <p className={`${small ? 'text-xl' : 'text-3xl'} font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {prefix}{value}
            </p>
        </div>

        <motion.div
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-50"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
        />
    </motion.div>
);

export default HistorialPagos;
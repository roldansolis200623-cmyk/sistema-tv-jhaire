import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign, Calendar, Plus, Filter, X, Trash2, TrendingUp, 
    Users, Search, CreditCard, Home, LogOut, FileText, BarChart3, 
    Settings, Bell, Printer, Download, CheckCircle
} from 'lucide-react';
import pagoService from '../services/pagoService';
import { clienteService } from '../services/api';
import PagoForm from '../components/PagoForm';
import { useAuth } from '../context/AuthContext';
import ReciboTemplate from '../components/ReciboTemplate';
import { generarReciboPDF, imprimirRecibo } from '../utils/reciboGenerator';

function Pagos() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [pagos, setPagos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [clientePreseleccionado, setClientePreseleccionado] = useState(null);
    const [estadisticas, setEstadisticas] = useState({
        pagos_hoy: 0,
        pagos_mes: 0,
        pagos_total: 0
    });

    const [filtroCliente, setFiltroCliente] = useState('');
    const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
    const [filtroFechaFin, setFiltroFechaFin] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [showReciboModal, setShowReciboModal] = useState(false);
    const [ultimoPago, setUltimoPago] = useState(null);
    const [clienteUltimoPago, setClienteUltimoPago] = useState(null);

    useEffect(() => {
        cargarDatos();
        if (location.state?.clienteId) {
            setClientePreseleccionado(location.state.clienteId);
            setShowForm(true);
        }
    }, [location]);

    const cargarDatos = async () => {
        try {
            const [pagosData, clientesData, estadisticasData] = await Promise.all([
                pagoService.getAll(),
                clienteService.getAll(),
                pagoService.getEstadisticas()
            ]);
            
            // ✅ Crear mapa de clientes para búsqueda rápida
            const clienteMap = {};
            clientesData.forEach(c => {
                clienteMap[c.id] = c;
            });
            
            // ✅ Agregar datos del cliente a cada pago si no los tiene
            const pagosConClientes = pagosData.map(pago => ({
                ...pago,
                cliente: pago.cliente || clienteMap[pago.cliente_id] || {
                    nombre: 'Desconocido',
                    apellido: '',
                    dni: 'N/A'
                }
            }));
            
            setPagos(pagosConClientes);
            setClientes(clientesData);
            setEstadisticas(estadisticasData);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNuevoPago = () => {
        setClientePreseleccionado(null);
        setShowForm(true);
    };

    const handlePagoGuardado = async (pagoData, clienteData) => {
        setShowForm(false);
        setClientePreseleccionado(null);
        
        setUltimoPago(pagoData);
        setClienteUltimoPago(clienteData);
        setShowReciboModal(true);
        
        await cargarDatos();
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este pago?')) {
            try {
                await pagoService.eliminar(id);
                await cargarDatos();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

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
        
        setUltimoPago(pagoCompleto);
        setClienteUltimoPago(pago.cliente);
        setShowReciboModal(true);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { icon: Home, label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { icon: Users, label: 'Clientes', onClick: () => navigate('/clientes') },
        { icon: CreditCard, label: 'Pagos', active: true },
        { icon: FileText, label: 'Reportes', onClick: () => navigate('/reportes') },
        { icon: Settings, label: 'Perfiles Internet', onClick: () => navigate('/perfiles-internet') },
        { icon: BarChart3, label: 'Estadísticas', onClick: () => navigate('/estadisticas') },
    ];

    const pagosFiltrados = pagos.filter(pago => {
        if (filtroCliente && pago.cliente_id !== parseInt(filtroCliente)) return false;
        if (filtroFechaInicio && pago.fecha_pago < filtroFechaInicio) return false;
        if (filtroFechaFin && pago.fecha_pago > filtroFechaFin) return false;
        return true;
    });

    const limpiarFiltros = () => {
        setFiltroCliente('');
        setFiltroFechaInicio('');
        setFiltroFechaFin('');
    };

    const filtrosActivos = (filtroCliente ? 1 : 0) + (filtroFechaInicio ? 1 : 0) + (filtroFechaFin ? 1 : 0);

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col shadow-2xl">
                <div className="p-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <motion.img 
                            src="/logo.png" 
                            alt="Logo" 
                            className="h-10 w-auto"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        />
                        <div>
                            <h2 className="font-bold text-white text-lg">TV Jhaire</h2>
                            <p className="text-xs text-cyan-300">GESTIÓN DE CLIENTES</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item, i) => (
                        <motion.button
                            key={i}
                            onClick={item.onClick}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                item.active
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                                    : 'text-gray-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </motion.button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                            {user?.nombre_completo?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-white">Administrador</p>
                            <p className="text-xs text-cyan-300">Sistema</p>
                        </div>
                    </div>
                    <motion.button
                        onClick={handleLogout}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all shadow-lg"
                    >
                        <LogOut size={18} />
                        Cerrar Sesión
                    </motion.button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-indigo-100 px-8 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Gestión de <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Pagos</span>
                            </h1>
                            <p className="text-sm text-gray-600">Administra los pagos de tus clientes</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <motion.button
                                onClick={handleNuevoPago}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-green-500/50"
                            >
                                <Plus size={18} />
                                Registrar Pago
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="relative p-2 bg-gradient-to-br from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 rounded-xl transition-all"
                            >
                                <Bell size={20} className="text-indigo-600" />
                            </motion.button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
                            />
                        </div>
                    ) : (
                        <>
                            {/* Estadísticas */}
                            <div className="grid grid-cols-3 gap-6 mb-8">
                                {[
                                    { 
                                        label: 'Pagos de Hoy', 
                                        value: estadisticas.pagos_hoy, 
                                        icon: DollarSign,
                                        gradient: 'from-green-500 to-emerald-500',
                                        bg: 'from-green-50 to-emerald-50'
                                    },
                                    { 
                                        label: 'Pagos del Mes', 
                                        value: estadisticas.pagos_mes, 
                                        icon: Calendar,
                                        gradient: 'from-blue-500 to-cyan-500',
                                        bg: 'from-blue-50 to-cyan-50'
                                    },
                                    { 
                                        label: 'Total Histórico', 
                                        value: estadisticas.pagos_total, 
                                        icon: TrendingUp,
                                        gradient: 'from-orange-500 to-red-500',
                                        bg: 'from-orange-50 to-red-50'
                                    }
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bg} p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-white/60`}
                                    >
                                        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br from-white/30 to-transparent blur-2xl" />
                                        <div className="relative">
                                            <div className="flex items-start justify-between mb-4">
                                                <motion.div 
                                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                                    transition={{ duration: 0.6 }}
                                                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                                                >
                                                    <stat.icon className="text-white" size={26} />
                                                </motion.div>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-600 mb-1">{stat.label}</p>
                                            <p className="text-3xl font-bold text-gray-900">S/ {stat.value.toFixed(2)}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Filtros */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-indigo-100 p-6 mb-6"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2 text-gray-900">
                                        <Filter size={20} />
                                        <h3 className="text-lg font-bold">Filtros</h3>
                                        {filtrosActivos > 0 && (
                                            <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                {filtrosActivos}
                                            </span>
                                        )}
                                    </div>
                                    <motion.button
                                        onClick={() => setShowFilters(!showFilters)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                                    >
                                        {showFilters ? 'Ocultar' : 'Mostrar'}
                                    </motion.button>
                                </div>

                                <AnimatePresence>
                                    {showFilters && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-indigo-100">
                                                <select
                                                    value={filtroCliente}
                                                    onChange={(e) => setFiltroCliente(e.target.value)}
                                                    className="px-4 py-2 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                >
                                                    <option value="">Todos los clientes</option>
                                                    {clientes.map(cliente => (
                                                        <option key={cliente.id} value={cliente.id}>
                                                            {cliente.nombre} {cliente.apellido}
                                                        </option>
                                                    ))}
                                                </select>

                                                <input
                                                    type="date"
                                                    value={filtroFechaInicio}
                                                    onChange={(e) => setFiltroFechaInicio(e.target.value)}
                                                    className="px-4 py-2 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                />

                                                <input
                                                    type="date"
                                                    value={filtroFechaFin}
                                                    onChange={(e) => setFiltroFechaFin(e.target.value)}
                                                    className="px-4 py-2 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                />

                                                <motion.button
                                                    onClick={limpiarFiltros}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <X size={16} />
                                                    Limpiar
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Tabla */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-indigo-100 overflow-hidden"
                            >
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                                            <tr>
                                                {['Cliente', 'DNI', 'Fecha', 'Monto', 'Meses', 'N° Recibo', 'Método', 'Observaciones', 'Acciones'].map((header) => (
                                                    <th key={header} className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-indigo-100">
                                            {pagosFiltrados.length === 0 ? (
                                                <tr>
                                                    <td colSpan="9" className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <Search className="text-gray-400" size={48} />
                                                            <p className="text-gray-600 text-lg">No se encontraron pagos</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                pagosFiltrados.map((pago, index) => (
                                                    <motion.tr
                                                        key={pago.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: index * 0.03 }}
                                                        whileHover={{ 
                                                            scale: 1.01,
                                                            backgroundColor: 'rgba(99, 102, 241, 0.05)',
                                                        }}
                                                        className="transition-all"
                                                    >
                                                        {/* ✅ COLUMNA CLIENTE - Muestra nombre */}
                                                        <td className="px-6 py-4">
                                                            <div className="font-semibold text-gray-900">
                                                                {pago.cliente?.nombre || 'Desconocido'} {pago.cliente?.apellido || ''}
                                                            </div>
                                                        </td>

                                                        {/* ✅ COLUMNA DNI - Desde objeto cliente */}
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-700">
                                                            {pago.cliente?.dni || 'N/A'}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="text-purple-600" size={16} />
                                                                <span className="text-sm text-gray-700">
                                                                    {new Date(pago.fecha_pago).toLocaleDateString('es-PE')}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-sm">
                                                                S/ {parseFloat(pago.monto).toFixed(2)}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold text-xs">
                                                                {pago.meses_detalle || `${pago.meses_pagados || 1} mes(es)`}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                                                            {pago.numero_recibo || '-'}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <CreditCard className="text-cyan-600" size={16} />
                                                                <span className="text-sm text-gray-700">{pago.metodo_pago}</span>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                            {pago.observaciones || '-'}
                                                        </td>

                                                        {/* ✅ COLUMNA ACCIONES - Solo UNA vez */}
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <motion.button
                                                                    onClick={() => handleVerRecibo(pago)}
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    className="p-2 text-indigo-600 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-all"
                                                                    title="Ver Recibo"
                                                                >
                                                                    <FileText size={16} />
                                                                </motion.button>

                                                                <motion.button
                                                                    onClick={() => handleEliminar(pago.id)}
                                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    className="p-2 text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-all"
                                                                    title="Eliminar"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </motion.button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </>
                    )}
                </main>
            </div>

            {/* Modal de Formulario */}
            <AnimatePresence>
                {showForm && (
                    <PagoForm
                        clientes={clientes}
                        clientePreseleccionado={clientePreseleccionado}
                        onClose={() => {
                            setShowForm(false);
                            setClientePreseleccionado(null);
                        }}
                        onPagoGuardado={handlePagoGuardado}
                    />
                )}
            </AnimatePresence>

            {/* Modal de Recibo */}
            <AnimatePresence>
                {showReciboModal && ultimoPago && clienteUltimoPago && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl border border-indigo-200"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                        Recibo de Pago
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        N° {ultimoPago.numero_recibo || `#${ultimoPago.id}`}
                                    </p>
                                </div>
                                <motion.button
                                    onClick={() => {
                                        setShowReciboModal(false);
                                        setUltimoPago(null);
                                        setClienteUltimoPago(null);
                                    }}
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>

                            {/* Detalles del Pago */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border border-indigo-100">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Cliente</p>
                                        <p className="font-bold text-gray-900">
                                            {clienteUltimoPago.nombre} {clienteUltimoPago.apellido}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">DNI</p>
                                        <p className="font-bold text-gray-900">
                                            {clienteUltimoPago.dni}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Monto</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            S/ {parseFloat(ultimoPago.monto).toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Fecha</p>
                                        <p className="font-bold text-gray-900">
                                            {new Date(ultimoPago.fecha).toLocaleDateString('es-PE', { 
                                                day: '2-digit', 
                                                month: 'long', 
                                                year: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Método de Pago</p>
                                        <p className="font-semibold text-gray-900">
                                            {ultimoPago.metodo_pago}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Meses Pagados</p>
                                        <p className="font-semibold text-gray-900">
                                            {ultimoPago.meses_pagados || 1} {ultimoPago.meses_pagados === 1 ? 'mes' : 'meses'}
                                        </p>
                                    </div>
                                </div>

                                {ultimoPago.observaciones && (
                                    <div className="mt-4 pt-4 border-t border-indigo-200">
                                        <p className="text-xs text-gray-600 mb-1">Observaciones</p>
                                        <p className="text-sm text-gray-700">
                                            {ultimoPago.observaciones}
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
                                        imprimirRecibo(ultimoPago, clienteUltimoPago);
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
                                        generarReciboPDF(ultimoPago, clienteUltimoPago);
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
                                        setUltimoPago(null);
                                        setClienteUltimoPago(null);
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                                >
                                    Cerrar
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Recibo oculto para generar PDF/Impresión */}
                        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                            <ReciboTemplate pago={ultimoPago} cliente={clienteUltimoPago} />
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Pagos;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Filter, X, Users, Search, Plus, Edit, Trash2, Play, Pause,
    MessageCircle, History, Home, LogOut, FileText, CreditCard,
    BarChart3, Settings, Bell, Menu, Calendar, AlertTriangle, Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clienteService } from '../services/api';
import incidenciaService from '../services/incidenciaService';  // 🆕 NUEVO
import WhatsAppModal from '../components/WhatsAppModal';
import SuspenderClienteModal from '../components/SuspenderClienteModal';
import ReactivarClienteModal from '../components/ReactivarClienteModal';
import ClienteDetallePanel from '../components/ClienteDetallePanel';
import HistorialSuspensionesModal from '../components/HistorialSuspensionesModal';
import ReciboRecordatorio from '../components/ReciboRecordatorio';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [whatsappModal, setWhatsappModal] = useState(null);
    const [suspenderModal, setSuspenderModal] = useState(null);
    const [reactivarModal, setReactivarModal] = useState(null);
    const [historialModal, setHistorialModal] = useState(null);
    const [clienteDetalle, setClienteDetalle] = useState(null);
    const [incidenciaModal, setIncidenciaModal] = useState(null);  // 🆕 NUEVO
    const [clienteParaRecibo, setClienteParaRecibo] = useState(null);  // 🆕 RECIBO

    const [filtros, setFiltros] = useState({
        estados: [],
        tiposServicio: [],
        deudaMin: '',
        deudaMax: '',
        soloDeudores: false
    });

    useEffect(() => {
        loadClientes();
    }, []);

    const loadClientes = async () => {
        try {
            const data = await clienteService.getAll();
            setClientes(data);
        } catch (error) {
            console.error('Error cargando clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este cliente?')) {
            try {
                await clienteService.delete(id);
                loadClientes();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleFiltroEstado = (estado) => {
        setFiltros(prev => ({
            ...prev,
            estados: prev.estados.includes(estado)
                ? prev.estados.filter(e => e !== estado)
                : [...prev.estados, estado]
        }));
    };

    const toggleFiltroServicio = (servicio) => {
        setFiltros(prev => ({
            ...prev,
            tiposServicio: prev.tiposServicio.includes(servicio)
                ? prev.tiposServicio.filter(s => s !== servicio)
                : [...prev.tiposServicio, servicio]
        }));
    };

    const limpiarFiltros = () => {
        setFiltros({
            estados: [],
            tiposServicio: [],
            deudaMin: '',
            deudaMax: '',
            soloDeudores: false
        });
    };

    // 🎨 FUNCIÓN PARA OBTENER COLOR SEGÚN DEUDA
    const getColorByDeuda = (mesesDeuda) => {
        if (mesesDeuda === 0) return 'bg-green-50 hover:bg-green-100 border-l-4 border-green-400';
        if (mesesDeuda === 1) return 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-400';
        if (mesesDeuda === 2) return 'bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-400';
        return 'bg-red-50 hover:bg-red-100 border-l-4 border-red-400'; // 3+ meses
    };

    const filteredClientes = clientes.filter(cliente => {
        const matchSearch = cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cliente.dni.includes(searchTerm) ||
                           (cliente.suministro && cliente.suministro.includes(searchTerm));  // 🆕 BUSCAR POR SUMINISTRO
        const matchEstado = filtros.estados.length === 0 || filtros.estados.includes(cliente.estado);
        const matchServicio = filtros.tiposServicio.length === 0 || filtros.tiposServicio.includes(cliente.tipo_servicio);
        const deuda = (cliente.precio_mensual || 0) * (cliente.meses_deuda || 0);
        const matchDeudaMin = filtros.deudaMin === '' || deuda >= parseFloat(filtros.deudaMin);
        const matchDeudaMax = filtros.deudaMax === '' || deuda <= parseFloat(filtros.deudaMax);
        const matchDeudores = !filtros.soloDeudores || (cliente.meses_deuda > 0);
        return matchSearch && matchEstado && matchServicio && matchDeudaMin && matchDeudaMax && matchDeudores;
    });

    const tiposServicioUnicos = [...new Set(clientes.map(c => c.tipo_servicio))];
    const filtrosActivos = filtros.estados.length + filtros.tiposServicio.length + 
                          (filtros.deudaMin ? 1 : 0) + (filtros.deudaMax ? 1 : 0) + 
                          (filtros.soloDeudores ? 1 : 0);

    const menuItems = [
        { icon: Home, label: 'Dashboard', onClick: () => { navigate('/dashboard'); setSidebarOpen(false); } },
        { icon: Users, label: 'Clientes', active: true },
        { icon: CreditCard, label: 'Pagos', onClick: () => { navigate('/pagos'); setSidebarOpen(false); } },
        { icon: Calendar, label: 'Calendario', onClick: () => { navigate('/calendario'); setSidebarOpen(false); } },
        { icon: AlertTriangle, label: 'Incidencias', onClick: () => { navigate('/incidencias'); setSidebarOpen(false); } },  // 🆕 NUEVO
        { icon: FileText, label: 'Reportes', onClick: () => { navigate('/reportes'); setSidebarOpen(false); } },
        { icon: Settings, label: 'Perfiles Internet', onClick: () => { navigate('/perfiles-internet'); setSidebarOpen(false); } },
        { icon: BarChart3, label: 'Estadísticas', onClick: () => { navigate('/estadisticas'); setSidebarOpen(false); } },
    ];

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* OVERLAY MÓVIL */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* SIDEBAR RESPONSIVE */}
            <aside className={`
                fixed lg:static
                w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
                flex flex-col shadow-2xl z-50
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                h-full
            `}>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden absolute top-4 right-4 text-white p-2 hover:bg-slate-700 rounded-lg"
                >
                    <X size={24} />
                </button>

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

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                            {user?.nombre?.charAt(0) || 'A'}
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
                        <span className="hidden sm:inline">Cerrar Sesión</span>
                        <span className="sm:hidden">Salir</span>
                    </motion.button>
                </div>
            </aside>

            {/* MAIN */}
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                {/* HEADER RESPONSIVE */}
                <motion.header 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/80 backdrop-blur-xl border-b border-indigo-100 px-4 lg:px-8 py-4 shadow-sm"
                >
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                            <Menu size={24} className="text-gray-700" />
                        </button>

                        <div className="flex-1">
                            <h1 className="text-lg lg:text-2xl font-bold text-gray-900">
                                <span className="hidden sm:inline">Gestión de </span>
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Clientes</span>
                            </h1>
                            <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">Administra todos tus clientes</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative hidden md:block">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, DNI o suministro..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 lg:w-80"
                                />
                            </div>
                        </div>
                    </div>

                    {/* BÚSQUEDA MÓVIL */}
                    <div className="mt-3 md:hidden">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, DNI o suministro..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </motion.header>

                {/* CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {/* ACTIONS RESPONSIVE */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-xl rounded-xl lg:rounded-2xl shadow-lg border border-indigo-100 p-4 lg:p-6 mb-4 lg:mb-6"
                    >
                        {/* 🎨 LEYENDA DE COLORES */}
                        <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-gray-700">🎨 Colores por estado financiero:</span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 border-l-4 border-green-400 rounded">
                                    <span className="font-semibold">🟢 Al día</span>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 border-l-4 border-yellow-400 rounded">
                                    <span className="font-semibold">🟡 1 mes</span>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 border-l-4 border-orange-400 rounded">
                                    <span className="font-semibold">🟠 2 meses</span>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 border-l-4 border-red-400 rounded">
                                    <span className="font-semibold">🔴 3+ meses</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <motion.button
                                onClick={() => setShowFilters(!showFilters)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold shadow-md transition-all ${
                                    filtrosActivos > 0
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/50'
                                        : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                                }`}
                            >
                                <Filter size={18} />
                                Filtros {filtrosActivos > 0 && `(${filtrosActivos})`}
                            </motion.button>

                            <motion.button
                                onClick={() => navigate('/clientes/nuevo')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/50"
                            >
                                <Plus size={18} />
                                Nuevo Cliente
                            </motion.button>

                            {/* 🆕 BOTÓN IMPRIMIR RECIBOS MOROSOS */}
                            {clientes.filter(c => c.meses_deuda > 0).length > 0 && (
                                <motion.button
                                    onClick={() => {
                                        const morosos = clientes.filter(c => c.meses_deuda > 0);
                                        if (morosos.length > 0) {
                                            setClienteParaRecibo(morosos[0]);
                                        }
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/50"
                                >
                                    <Printer size={18} />
                                    <span className="hidden lg:inline">Recibos Morosos</span>
                                    <span className="lg:hidden">Recibos</span>
                                    <span className="bg-white text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                        {clientes.filter(c => c.meses_deuda > 0).length}
                                    </span>
                                </motion.button>
                            )}
                        </div>

                        {/* FILTROS PANEL RESPONSIVE */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-indigo-100 mt-4 lg:mt-6 pt-4 lg:pt-6 overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Estado</label>
                                            <div className="flex gap-2">
                                                {['activo', 'suspendido'].map(estado => (
                                                    <motion.button
                                                        key={estado}
                                                        onClick={() => toggleFiltroEstado(estado)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={`flex-1 px-3 lg:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                                            filtros.estados.includes(estado)
                                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                                                : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
                                                        }`}
                                                    >
                                                        {estado.charAt(0).toUpperCase() + estado.slice(1)}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Servicio</label>
                                            <div className="flex flex-wrap gap-2">
                                                {tiposServicioUnicos.map(servicio => (
                                                    <motion.button
                                                        key={servicio}
                                                        onClick={() => toggleFiltroServicio(servicio)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={`px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-semibold ${
                                                            filtros.tiposServicio.includes(servicio)
                                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                                                : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
                                                        }`}
                                                    >
                                                        {servicio}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Deuda</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Mín"
                                                    value={filtros.deudaMin}
                                                    onChange={(e) => setFiltros({...filtros, deudaMin: e.target.value})}
                                                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Máx"
                                                    value={filtros.deudaMax}
                                                    onChange={(e) => setFiltros({...filtros, deudaMax: e.target.value})}
                                                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {filtrosActivos > 0 && (
                                        <motion.button
                                            onClick={limpiarFiltros}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg text-sm font-semibold shadow-lg"
                                        >
                                            <X size={16} />
                                            Limpiar Filtros
                                        </motion.button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* INDICADOR */}
                    {filtrosActivos > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 lg:mb-6 px-4 lg:px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-lg"
                        >
                            <p className="text-sm font-semibold text-blue-900">
                                Mostrando <span className="text-blue-600 text-lg">{filteredClientes.length}</span> de <span className="text-gray-600">{clientes.length}</span> clientes
                            </p>
                        </motion.div>
                    )}

                    {/* TABLA/CARDS RESPONSIVE */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
                            />
                        </div>
                    ) : (
                        <>
                            {/* VISTA MÓVIL - CARDS */}
                            <div className="lg:hidden space-y-4">
                                <AnimatePresence>
                                    {filteredClientes.map((cliente, i) => (
                                        <motion.div
                                            key={cliente.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`backdrop-blur-xl rounded-xl shadow-lg border p-4 ${getColorByDeuda(cliente.meses_deuda || 0)}`}
                                            onClick={() => setClienteDetalle(cliente)}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-900">{cliente.nombre} {cliente.apellido}</h3>
                                                    <p className="text-sm text-indigo-600 font-medium">{cliente.tipo_servicio}</p>
                                                    <p className="text-xs text-gray-500 mt-1">DNI: {cliente.dni}</p>
                                                    {cliente.suministro && (
                                                        <p className="text-xs text-gray-500">Suministro: {cliente.suministro}</p>
                                                    )}
                                                </div>
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                    cliente.estado === 'activo' ? 'bg-green-100 text-green-800' :
                                                    cliente.estado === 'suspendido' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {cliente.estado.toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Teléfono:</span>
                                                    <p className="font-medium text-gray-900">{cliente.telefono}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Plan:</span>
                                                    <p className="font-medium text-gray-900">{cliente.plan}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-gray-500">Precio:</span>
                                                    <p className="text-lg font-bold text-green-600">S/ {cliente.precio_mensual}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { icon: Edit, label: 'Editar', color: 'blue', onClick: (e) => { e.stopPropagation(); navigate(`/clientes/editar/${cliente.id}`); } },
                                                    { icon: AlertTriangle, label: 'Avería', color: 'red', onClick: (e) => { e.stopPropagation(); setIncidenciaModal(cliente); } }, // 🆕 NUEVO
                                                    { icon: cliente.estado === 'activo' ? Pause : Play, label: cliente.estado === 'activo' ? 'Suspender' : 'Activar', color: cliente.estado === 'activo' ? 'orange' : 'green', onClick: (e) => { e.stopPropagation(); cliente.estado === 'activo' ? setSuspenderModal(cliente) : setReactivarModal(cliente); } },
                                                    { icon: MessageCircle, label: 'WhatsApp', color: 'green', onClick: (e) => { e.stopPropagation(); setWhatsappModal(cliente); } },
                                                    { icon: History, label: 'Historial', color: 'purple', onClick: (e) => { e.stopPropagation(); navigate(`/historial-pagos/${cliente.id}`); } },
                                                    ...(cliente.meses_deuda > 0 ? [{ icon: FileText, label: 'Recibo', color: 'red', onClick: (e) => { e.stopPropagation(); setClienteParaRecibo(cliente); } }] : [])
                                                ].map((action, idx) => (
                                                    <motion.button
                                                        key={idx}
                                                        onClick={action.onClick}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-${action.color}-600 bg-${action.color}-100 hover:bg-${action.color}-200 rounded-lg text-sm font-medium transition-all`}
                                                    >
                                                        <action.icon size={16} />
                                                        <span className="hidden sm:inline">{action.label}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* VISTA DESKTOP - TABLA */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="hidden lg:block bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-indigo-100 overflow-hidden"
                            >
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                                            <tr>
                                                {['DNI', 'Cliente', 'Teléfono', 'Plan', 'Precio', 'Estado', 'Acciones'].map((header) => (
                                                    <th key={header} className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-indigo-100">
                                            <AnimatePresence>
                                                {filteredClientes.map((cliente, i) => (
                                                    <motion.tr
                                                        key={cliente.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        whileHover={{ 
                                                            scale: 1.01,
                                                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.1)'
                                                        }}
                                                        className={`cursor-pointer transition-all ${getColorByDeuda(cliente.meses_deuda || 0)}`}
                                                        onClick={(e) => {
                                                            if (!e.target.closest('button')) {
                                                                setClienteDetalle(cliente);
                                                            }
                                                        }}
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-bold text-gray-900">{cliente.dni}</div>
                                                            {cliente.suministro && (
                                                                <div className="text-xs text-gray-500">Sum: {cliente.suministro}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-bold text-gray-900">{cliente.nombre} {cliente.apellido}</div>
                                                            <div className="text-xs text-indigo-600 font-medium">{cliente.tipo_servicio}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{cliente.telefono}</td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{cliente.plan}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                                                S/ {cliente.precio_mensual}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <motion.span 
                                                                whileHover={{ scale: 1.1 }}
                                                                className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                                                                    cliente.estado === 'activo' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50' :
                                                                    cliente.estado === 'suspendido' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50' :
                                                                    'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/50'
                                                                }`}
                                                            >
                                                                {cliente.estado.toUpperCase()}
                                                            </motion.span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                {[
                                                                    { icon: Edit, color: 'blue', onClick: () => navigate(`/clientes/editar/${cliente.id}`) },
                                                                    { icon: AlertTriangle, color: 'red', onClick: () => setIncidenciaModal(cliente) }, // 🆕 NUEVO
                                                                    { icon: cliente.estado === 'activo' ? Pause : Play, color: cliente.estado === 'activo' ? 'orange' : 'green', onClick: () => cliente.estado === 'activo' ? setSuspenderModal(cliente) : setReactivarModal(cliente) },
                                                                    { icon: MessageCircle, color: 'green', onClick: () => setWhatsappModal(cliente) },
                                                                    { icon: History, color: 'purple', onClick: () => navigate(`/historial-pagos/${cliente.id}`) },
                                                                    ...(cliente.meses_deuda > 0 ? [{ icon: FileText, color: 'red', onClick: () => setClienteParaRecibo(cliente) }] : []),
                                                                    { icon: Trash2, color: 'red', onClick: () => handleDelete(cliente.id) }
                                                                ].map((action, idx) => (
                                                                    <motion.button
                                                                        key={idx}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            action.onClick();
                                                                        }}
                                                                        whileHover={{ scale: 1.2, rotate: 5 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        className={`p-2 text-${action.color}-600 bg-${action.color}-100 hover:bg-${action.color}-200 rounded-lg transition-all`}
                                                                    >
                                                                        <action.icon size={16} />
                                                                    </motion.button>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </>
                    )}
                </main>
            </div>

            {/* MODALES */}
            {whatsappModal && <WhatsAppModal cliente={whatsappModal} onClose={() => setWhatsappModal(null)} />}
            {suspenderModal && <SuspenderClienteModal cliente={suspenderModal} onClose={() => setSuspenderModal(null)} onSuccess={loadClientes} />}
            {reactivarModal && <ReactivarClienteModal cliente={reactivarModal} onClose={() => setReactivarModal(null)} onSuccess={loadClientes} />}
            {historialModal && <HistorialSuspensionesModal cliente={historialModal} onClose={() => setHistorialModal(null)} />}
            {clienteDetalle && (
                <ClienteDetallePanel
                    cliente={clienteDetalle}
                    onClose={() => setClienteDetalle(null)}
                    onSuspender={(c) => { setClienteDetalle(null); setSuspenderModal(c); }}
                    onReactivar={(c) => { setClienteDetalle(null); setReactivarModal(c); }}
                    onWhatsApp={(c) => { setClienteDetalle(null); setWhatsappModal(c); }}
                />
            )}
            {/* 🆕 MODAL DE INCIDENCIA */}
            {incidenciaModal && (
                <ReportarIncidenciaModal
                    cliente={incidenciaModal}
                    onClose={() => setIncidenciaModal(null)}
                    onSuccess={() => {
                        setIncidenciaModal(null);
                        alert('Incidencia reportada exitosamente');
                    }}
                />
            )}
            {/* 🆕 MODAL DE RECIBO */}
            {clienteParaRecibo && (
                <ReciboRecordatorio
                    cliente={clienteParaRecibo}
                    onClose={() => setClienteParaRecibo(null)}
                />
            )}
        </div>
    );
};

// 🆕 COMPONENTE MODAL PARA REPORTAR INCIDENCIA
const ReportarIncidenciaModal = ({ cliente, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        tipo: 'averia',
        titulo: '',
        descripcion: '',
        prioridad: 'media',
        tecnico_asignado: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await incidenciaService.create({
                ...formData,
                cliente_id: cliente.id
            });
            onSuccess();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al reportar incidencia');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 p-6 rounded-t-2xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Reportar Incidencia</h2>
                            <p className="text-white/80">{cliente.nombre} {cliente.apellido}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg text-white">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Incidencia</label>
                        <select
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            required
                        >
                            <option value="averia">Avería</option>
                            <option value="soporte">Soporte Técnico</option>
                            <option value="mantenimiento">Mantenimiento</option>
                            <option value="instalacion">Instalación</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Título</label>
                        <input
                            type="text"
                            value={formData.titulo}
                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                            placeholder="Ej: Sin señal de internet"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción Detallada</label>
                        <textarea
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            placeholder="Describe el problema o incidencia..."
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Prioridad</label>
                            <select
                                value={formData.prioridad}
                                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="baja">Baja</option>
                                <option value="media">Media</option>
                                <option value="alta">Alta</option>
                                <option value="urgente">Urgente</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Técnico (Opcional)</label>
                            <input
                                type="text"
                                value={formData.tecnico_asignado}
                                onChange={(e) => setFormData({ ...formData, tecnico_asignado: e.target.value })}
                                placeholder="Nombre del técnico"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    />
                                    Reportando...
                                </>
                            ) : (
                                <>
                                    <AlertTriangle size={20} />
                                    Reportar
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default Clientes;
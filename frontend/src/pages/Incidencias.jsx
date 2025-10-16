import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AlertTriangle, Plus, Search, Filter, Clock, CheckCircle,
    XCircle, Home, LogOut, Users, CreditCard, FileText, 
    BarChart3, Settings, Bell, Menu, X, Calendar,
    Phone, MapPin, Wrench, Tool, Zap, User, Edit,
    PlayCircle, CheckCheck, Ban, Trash2, Eye
} from 'lucide-react';
import incidenciaService from '../services/incidenciaService';
import { useAuth } from '../context/AuthContext';

const Incidencias = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [incidencias, setIncidencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editando, setEditando] = useState(null);
    const [filtro, setFiltro] = useState('todas');
    const [busqueda, setBusqueda] = useState('');
    const [selectedIncidencia, setSelectedIncidencia] = useState(null);

    useEffect(() => {
        cargarIncidencias();
    }, []);

    const cargarIncidencias = async () => {
        try {
            setLoading(true);
            const data = await incidenciaService.getAll();
            setIncidencias(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { icon: Home, label: 'Dashboard', onClick: () => { navigate('/dashboard'); setSidebarOpen(false); } },
        { icon: Users, label: 'Clientes', onClick: () => { navigate('/clientes'); setSidebarOpen(false); } },
        { icon: CreditCard, label: 'Pagos', onClick: () => { navigate('/pagos'); setSidebarOpen(false); } },
        { icon: Calendar, label: 'Calendario', onClick: () => { navigate('/calendario'); setSidebarOpen(false); } },
        { icon: AlertTriangle, label: 'Incidencias', active: true },
        { icon: FileText, label: 'Reportes', onClick: () => { navigate('/reportes'); setSidebarOpen(false); } },
        { icon: Settings, label: 'Perfiles Internet', onClick: () => { navigate('/perfiles-internet'); setSidebarOpen(false); } },
        { icon: BarChart3, label: 'Estadísticas', onClick: () => { navigate('/estadisticas'); setSidebarOpen(false); } },
    ];

    const incidenciasFiltradas = incidencias.filter(inc => {
        const matchFiltro = filtro === 'todas' || inc.estado === filtro;
        const matchBusqueda = inc.cliente_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                             inc.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
                             inc.dni?.includes(busqueda);
        return matchFiltro && matchBusqueda;
    });

    const stats = {
        total: incidencias.length,
        pendientes: incidencias.filter(i => i.estado === 'pendiente').length,
        en_proceso: incidencias.filter(i => i.estado === 'en_proceso').length,
        resueltas: incidencias.filter(i => i.estado === 'resuelto').length,
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente', icon: Clock },
            en_proceso: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En Proceso', icon: PlayCircle },
            resuelto: { bg: 'bg-green-100', text: 'text-green-800', label: 'Resuelto', icon: CheckCircle },
            cancelado: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelado', icon: XCircle }
        };
        const badge = badges[estado] || badges.pendiente;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${badge.bg} ${badge.text} text-xs font-semibold`}>
                <Icon size={14} />
                {badge.label}
            </span>
        );
    };

    const getPrioridadBadge = (prioridad) => {
        const badges = {
            baja: { bg: 'bg-gray-100', text: 'text-gray-700' },
            media: { bg: 'bg-blue-100', text: 'text-blue-700' },
            alta: { bg: 'bg-orange-100', text: 'text-orange-700' },
            urgente: { bg: 'bg-red-100', text: 'text-red-700' }
        };
        const badge = badges[prioridad] || badges.media;
        return (
            <span className={`px-2 py-1 rounded ${badge.bg} ${badge.text} text-xs font-bold uppercase`}>
                {prioridad}
            </span>
        );
    };

    const getTipoIcon = (tipo) => {
        const icons = {
            averia: { icon: AlertTriangle, color: 'text-red-500' },
            soporte: { icon: Tool, color: 'text-blue-500' },
            mantenimiento: { icon: Wrench, color: 'text-green-500' },
            instalacion: { icon: Zap, color: 'text-purple-500' }
        };
        const item = icons[tipo] || icons.averia;
        const Icon = item.icon;
        return <Icon className={item.color} size={20} />;
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* OVERLAY */}
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

            {/* SIDEBAR */}
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
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
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
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Cerrar Sesión</span>
                    </motion.button>
                </div>
            </aside>

            {/* MAIN */}
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                {/* HEADER */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-indigo-100 px-4 lg:px-8 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-indigo-100 rounded-lg"
                        >
                            <Menu size={24} className="text-gray-700" />
                        </button>

                        <div className="flex-1">
                            <h1 className="text-lg lg:text-2xl font-bold text-gray-900">
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Incidencias</span>
                            </h1>
                            <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">Gestión de averías y soporte técnico</p>
                        </div>

                        <motion.button
                            onClick={() => { setEditando(null); setShowForm(true); }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-3 lg:px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg text-sm"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Nueva Incidencia</span>
                            <span className="sm:hidden">Nueva</span>
                        </motion.button>
                    </div>
                </header>

                {/* CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {/* STATS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
                        <StatsCard label="Total" value={stats.total} icon={AlertTriangle} gradient="from-blue-500 to-cyan-500" />
                        <StatsCard label="Pendientes" value={stats.pendientes} icon={Clock} gradient="from-yellow-500 to-orange-500" />
                        <StatsCard label="En Proceso" value={stats.en_proceso} icon={PlayCircle} gradient="from-blue-500 to-indigo-500" />
                        <StatsCard label="Resueltas" value={stats.resueltas} icon={CheckCircle} gradient="from-green-500 to-emerald-500" />
                    </div>

                    {/* FILTROS */}
                    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por cliente, título o DNI..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 overflow-x-auto">
                                {['todas', 'pendiente', 'en_proceso', 'resuelto'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFiltro(f)}
                                        className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                                            filtro === f
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {f === 'todas' ? 'Todas' : f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* LISTA MÓVIL */}
                    <div className="lg:hidden space-y-4">
                        {incidenciasFiltradas.map((inc) => (
                            <motion.div
                                key={inc.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl shadow-lg p-4"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {getTipoIcon(inc.tipo)}
                                        <div>
                                            <h3 className="font-bold text-gray-900">{inc.titulo}</h3>
                                            <p className="text-sm text-gray-600">{inc.cliente_nombre}</p>
                                        </div>
                                    </div>
                                    {getEstadoBadge(inc.estado)}
                                </div>

                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{inc.descripcion}</p>

                                <div className="flex items-center justify-between">
                                    {getPrioridadBadge(inc.prioridad)}
                                    <button
                                        onClick={() => setSelectedIncidencia(inc)}
                                        className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1"
                                    >
                                        <Eye size={16} />
                                        Ver
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* TABLA DESKTOP */}
                    <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                                <tr>
                                    {['Tipo', 'Título', 'Cliente', 'Prioridad', 'Estado', 'Técnico', 'Fecha', 'Acciones'].map(h => (
                                        <th key={h} className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {incidenciasFiltradas.map((inc) => (
                                    <motion.tr
                                        key={inc.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                                    >
                                        <td className="px-6 py-4">{getTipoIcon(inc.tipo)}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{inc.titulo}</div>
                                            <div className="text-sm text-gray-500 line-clamp-1">{inc.descripcion}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{inc.cliente_nombre}</div>
                                            <div className="text-sm text-gray-500">{inc.telefono}</div>
                                        </td>
                                        <td className="px-6 py-4">{getPrioridadBadge(inc.prioridad)}</td>
                                        <td className="px-6 py-4">{getEstadoBadge(inc.estado)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{inc.tecnico_asignado || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {new Date(inc.fecha_reporte).toLocaleDateString('es-PE')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedIncidencia(inc)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            {/* MODAL DETALLE */}
            {selectedIncidencia && (
                <IncidenciaDetalle 
                    incidencia={selectedIncidencia}
                    onClose={() => setSelectedIncidencia(null)}
                    onReload={cargarIncidencias}
                />
            )}
        </div>
    );
};

const StatsCard = ({ label, value, icon: Icon, gradient }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
        <div className="relative">
            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}>
                <Icon className="text-white" size={20} />
            </div>
            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">{label}</p>
            <p className={`text-2xl lg:text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {value}
            </p>
        </div>
    </motion.div>
);

const IncidenciaDetalle = ({ incidencia, onClose, onReload }) => {
    const [accion, setAccion] = useState(null);
    const [tecnico, setTecnico] = useState('');
    const [solucion, setSolucion] = useState('');
    const [motivo, setMotivo] = useState('');

    const handleAccion = async () => {
        try {
            if (accion === 'iniciar') {
                await incidenciaService.iniciarAtencion(incidencia.id, tecnico);
            } else if (accion === 'resolver') {
                await incidenciaService.resolver(incidencia.id, solucion, tecnico);
            } else if (accion === 'cancelar') {
                await incidenciaService.cancelar(incidencia.id, motivo);
            }
            onReload();
            onClose();
        } catch (error) {
            console.error('Error:', error);
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
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">{incidencia.titulo}</h2>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                                    {incidencia.tipo}
                                </span>
                                <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                                    {incidencia.prioridad}
                                </span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg text-white">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Info Cliente */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <User size={20} className="text-indigo-600" />
                            Cliente
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                            <p className="text-gray-900 font-semibold">{incidencia.cliente_nombre}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <Phone size={14} /> {incidencia.telefono}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <MapPin size={14} /> {incidencia.direccion}
                            </p>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Descripción</h3>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{incidencia.descripcion}</p>
                    </div>

                    {/* Estado */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Estado Actual</h3>
                        <div className="flex items-center gap-4">
                            <span className={`px-4 py-2 rounded-lg font-semibold ${
                                incidencia.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                incidencia.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                                incidencia.estado === 'resuelto' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {incidencia.estado}
                            </span>
                            {incidencia.tecnico_asignado && (
                                <span className="text-sm text-gray-600">
                                    Técnico: <strong>{incidencia.tecnico_asignado}</strong>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Acciones */}
                    {incidencia.estado !== 'resuelto' && incidencia.estado !== 'cancelado' && (
                        <div className="border-t pt-6">
                            <h3 className="font-bold text-gray-900 mb-4">Acciones</h3>
                            
                            {!accion && (
                                <div className="flex gap-3">
                                    {incidencia.estado === 'pendiente' && (
                                        <button
                                            onClick={() => setAccion('iniciar')}
                                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                                        >
                                            <PlayCircle size={20} />
                                            Iniciar Atención
                                        </button>
                                    )}
                                    {incidencia.estado === 'en_proceso' && (
                                        <button
                                            onClick={() => setAccion('resolver')}
                                            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
                                        >
                                            <CheckCheck size={20} />
                                            Resolver
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setAccion('cancelar')}
                                        className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 flex items-center justify-center gap-2"
                                    >
                                        <Ban size={20} />
                                        Cancelar
                                    </button>
                                </div>
                            )}

                            {accion === 'iniciar' && (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Nombre del técnico"
                                        value={tecnico}
                                        onChange={(e) => setTecnico(e.target.value)}
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex gap-3">
                                        <button onClick={handleAccion} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold">
                                            Confirmar
                                        </button>
                                        <button onClick={() => setAccion(null)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {accion === 'resolver' && (
                                <div className="space-y-4">
                                    <textarea
                                        placeholder="Describe la solución aplicada..."
                                        value={solucion}
                                        onChange={(e) => setSolucion(e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Técnico que resolvió"
                                        value={tecnico}
                                        onChange={(e) => setTecnico(e.target.value)}
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                                    />
                                    <div className="flex gap-3">
                                        <button onClick={handleAccion} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold">
                                            Confirmar
                                        </button>
                                        <button onClick={() => setAccion(null)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {accion === 'cancelar' && (
                                <div className="space-y-4">
                                    <textarea
                                        placeholder="Motivo de cancelación..."
                                        value={motivo}
                                        onChange={(e) => setMotivo(e.target.value)}
                                        rows="3"
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500"
                                    />
                                    <div className="flex gap-3">
                                        <button onClick={handleAccion} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold">
                                            Confirmar
                                        </button>
                                        <button onClick={() => setAccion(null)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Incidencias;
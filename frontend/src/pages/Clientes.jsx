import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Filter, X, Users, Search, Plus, Edit, Trash2, Play, Pause,
    MessageCircle, History, Home, LogOut, FileText, CreditCard,
    BarChart3, Settings, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clienteService } from '../services/api';
import WhatsAppModal from '../components/WhatsAppModal';
import SuspenderClienteModal from '../components/SuspenderClienteModal';
import ReactivarClienteModal from '../components/ReactivarClienteModal';
import ClienteDetallePanel from '../components/ClienteDetallePanel';
import HistorialSuspensionesModal from '../components/HistorialSuspensionesModal';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [whatsappModal, setWhatsappModal] = useState(null);
    const [suspenderModal, setSuspenderModal] = useState(null);
    const [reactivarModal, setReactivarModal] = useState(null);
    const [historialModal, setHistorialModal] = useState(null);
    const [clienteDetalle, setClienteDetalle] = useState(null);

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

    const filteredClientes = clientes.filter(cliente => {
        const matchSearch = cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cliente.dni.includes(searchTerm);
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
        { icon: Home, label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { icon: Users, label: 'Clientes', active: true },
        { icon: CreditCard, label: 'Pagos', onClick: () => navigate('/pagos') },
        { icon: FileText, label: 'Reportes', onClick: () => navigate('/reportes') },
        { icon: Settings, label: 'Perfiles Internet', onClick: () => navigate('/perfiles-internet') },
        { icon: BarChart3, label: 'Estadísticas', onClick: () => navigate('/estadisticas') },
    ];

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
                <motion.header 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/80 backdrop-blur-xl border-b border-indigo-100 px-8 py-4 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Gestión de <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Clientes</span>
                            </h1>
                            <p className="text-sm text-gray-600">Administra todos tus clientes</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar cliente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="relative p-2 bg-gradient-to-br from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 rounded-xl transition-all"
                            >
                                <Bell size={20} className="text-indigo-600" />
                            </motion.button>
                        </div>
                    </div>
                </motion.header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    {/* Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-indigo-100 p-6 mb-6"
                    >
                        <div className="flex flex-wrap gap-3">
                            <motion.button
                                onClick={() => setShowFilters(!showFilters)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all ${
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
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/50 hover:shadow-xl"
                            >
                                <Plus size={18} />
                                Nuevo Cliente
                            </motion.button>
                        </div>

                        {/* Filtros Panel */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-indigo-100 mt-6 pt-6 overflow-hidden"
                                >
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Estado</label>
                                            <div className="flex gap-2">
                                                {['activo', 'suspendido'].map(estado => (
                                                    <motion.button
                                                        key={estado}
                                                        onClick={() => toggleFiltroEstado(estado)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
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
                                                        className={`px-4 py-2 rounded-lg text-sm font-semibold ${
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

                    {/* Indicador */}
                    {filtrosActivos > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-lg"
                        >
                            <p className="text-sm font-semibold text-blue-900">
                                Mostrando <span className="text-blue-600 text-lg">{filteredClientes.length}</span> de <span className="text-gray-600">{clientes.length}</span> clientes
                            </p>
                        </motion.div>
                    )}

                    {/* Tabla */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
                            />
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-indigo-100 overflow-hidden"
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
                                                        backgroundColor: 'rgba(99, 102, 241, 0.05)',
                                                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.1)'
                                                    }}
                                                    className="cursor-pointer transition-all"
                                                    onClick={(e) => {
                                                        if (!e.target.closest('button')) {
                                                            setClienteDetalle(cliente);
                                                        }
                                                    }}
                                                >
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{cliente.dni}</td>
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
                                                                { icon: cliente.estado === 'activo' ? Pause : Play, color: cliente.estado === 'activo' ? 'orange' : 'green', onClick: () => cliente.estado === 'activo' ? setSuspenderModal(cliente) : setReactivarModal(cliente) },
                                                                { icon: MessageCircle, color: 'green', onClick: () => setWhatsappModal(cliente) },
                                                                { icon: History, color: 'purple', onClick: () => navigate(`/historial-pagos/${cliente.id}`) },
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
                    )}
                </main>
            </div>

            {/* Modales */}
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
        </div>
    );
};

export default Clientes;
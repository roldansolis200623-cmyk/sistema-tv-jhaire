import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Edit, Zap, DollarSign, Wifi, Save, X,
    Home, LogOut, Users, CreditCard, FileText, BarChart3, 
    Settings, Bell, Menu, Calendar
} from 'lucide-react';
import perfilInternetService from '../services/perfilInternetService';
import { useAuth } from '../context/AuthContext';

const PerfilesInternet = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [perfiles, setPerfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editando, setEditando] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        nombre: '',
        velocidad: '',
        precio_regular: '',
        precio_minimo: '',
        descripcion: ''
    });

    useEffect(() => {
        cargarPerfiles();
    }, []);

    const cargarPerfiles = async () => {
        try {
            const data = await perfilInternetService.getAll();
            setPerfiles(data);
        } catch (error) {
            console.error('Error cargando perfiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editando) {
                await perfilInternetService.update(editando.id, formData);
            } else {
                await perfilInternetService.create(formData);
            }
            setShowForm(false);
            setEditando(null);
            setFormData({ nombre: '', velocidad: '', precio_regular: '', precio_minimo: '', descripcion: '' });
            cargarPerfiles();
        } catch (error) {
            console.error('Error guardando perfil:', error);
        }
    };

    const handleEditar = (perfil) => {
        setEditando(perfil);
        setFormData({
            nombre: perfil.nombre,
            velocidad: perfil.velocidad,
            precio_regular: perfil.precio_regular,
            precio_minimo: perfil.precio_minimo,
            descripcion: perfil.descripcion || ''
        });
        setShowForm(true);
    };

    const handleNuevo = () => {
        setEditando(null);
        setFormData({ nombre: '', velocidad: '', precio_regular: '', precio_minimo: '', descripcion: '' });
        setShowForm(true);
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
        { icon: FileText, label: 'Reportes', onClick: () => { navigate('/reportes'); setSidebarOpen(false); } },
        { icon: Settings, label: 'Perfiles Internet', active: true },
        { icon: BarChart3, label: 'Estadísticas', onClick: () => { navigate('/estadisticas'); setSidebarOpen(false); } },
    ];

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
                                <span className="hidden sm:inline">Perfiles de </span>
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Internet</span>
                            </h1>
                            <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">Configura velocidades y precios de tus planes</p>
                        </div>

                        <motion.button
                            onClick={handleNuevo}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-3 lg:px-5 py-2 lg:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg text-sm"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Nuevo Perfil</span>
                            <span className="sm:inline lg:hidden">Nuevo</span>
                        </motion.button>
                    </div>
                </motion.header>

                {/* CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {/* MÓVIL - CARDS */}
                    <div className="lg:hidden space-y-4">
                        {perfiles.map((perfil, i) => (
                            <motion.div
                                key={perfil.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-indigo-100 p-4"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900">{perfil.nombre}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Wifi className="text-cyan-600" size={16} />
                                            <span className="text-sm text-gray-600">{perfil.velocidad} Mbps</span>
                                        </div>
                                    </div>
                                    <motion.button
                                        onClick={() => handleEditar(perfil)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg"
                                    >
                                        <Edit size={18} />
                                    </motion.button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <span className="text-xs text-gray-500">Precio Regular:</span>
                                        <p className="text-lg font-bold text-green-600">S/ {perfil.precio_regular}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Precio Mínimo:</span>
                                        <p className="text-lg font-bold text-yellow-600">S/ {perfil.precio_minimo}</p>
                                    </div>
                                </div>

                                {perfil.descripcion && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        {perfil.descripcion}
                                    </p>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* DESKTOP - TABLA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hidden lg:block bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-indigo-100 overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                                    <tr>
                                        {['Nombre', 'Velocidad', 'Precio Regular', 'Precio Mínimo', 'Descripción', 'Acciones'].map((header) => (
                                            <th key={header} className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-indigo-100">
                                    {perfiles.map((perfil, i) => (
                                        <motion.tr
                                            key={perfil.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            whileHover={{ 
                                                scale: 1.01,
                                                backgroundColor: 'rgba(99, 102, 241, 0.05)',
                                            }}
                                            className="transition-all"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-900">{perfil.nombre}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Wifi className="text-cyan-600" size={18} />
                                                    <span className="text-sm font-medium text-gray-700">{perfil.velocidad} Mbps</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-sm">
                                                    S/ {perfil.precio_regular}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-bold text-sm">
                                                    S/ {perfil.precio_minimo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {perfil.descripcion || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <motion.button
                                                    onClick={() => handleEditar(perfil)}
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-2 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all"
                                                >
                                                    <Edit size={16} />
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </main>
            </div>

            {/* MODAL FORMULARIO RESPONSIVE */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl lg:rounded-2xl shadow-2xl w-full max-w-2xl border border-indigo-100 p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Zap className="text-white" size={20} />
                                </div>
                                {editando ? 'Editar Perfil' : 'Nuevo Perfil'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                                            Nombre del Plan *
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            placeholder="Internet Básico"
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                                            <Wifi size={16} className="text-cyan-600" />
                                            Velocidad (Mbps) *
                                        </label>
                                        <input
                                            type="number"
                                            name="velocidad"
                                            value={formData.velocidad}
                                            onChange={handleChange}
                                            placeholder="50"
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                                            <DollarSign size={16} className="text-green-600" />
                                            Precio Regular (S/) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="precio_regular"
                                            value={formData.precio_regular}
                                            onChange={handleChange}
                                            placeholder="65.00"
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                                            <DollarSign size={16} className="text-yellow-600" />
                                            Precio Mínimo (S/) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="precio_minimo"
                                            value={formData.precio_minimo}
                                            onChange={handleChange}
                                            placeholder="50.00"
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Plan básico para uso residencial..."
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <motion.button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <X size={20} />
                                        Cancelar
                                    </motion.button>
                                    
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save size={20} />
                                        Guardar
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PerfilesInternet;
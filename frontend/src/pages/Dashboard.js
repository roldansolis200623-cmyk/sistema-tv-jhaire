import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, UserCheck, UserX, DollarSign,
    FileText, CreditCard, BarChart3, Settings,
    Home, LogOut, TrendingUp, AlertCircle,
    Clock, Award, ArrowRight, Calendar, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clienteService } from '../services/api';
import NotificationBell from '../components/NotificationBell';

const Dashboard = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const stats = {
        total: clientes.length,
        activos: clientes.filter(c => c.estado === 'activo').length,
        suspendidos: clientes.filter(c => c.estado === 'suspendido').length,
        ingresos: clientes.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0)
    };

    const clientesConDeuda = clientes.filter(c => c.meses_deuda > 0);
    const topClientes = [...clientes]
        .sort((a, b) => parseFloat(b.precio_mensual) - parseFloat(a.precio_mensual))
        .slice(0, 5);
    
    const actividadReciente = clientes.slice(-5).reverse();

    const menuItems = [
        { icon: Home, label: 'Dashboard', active: true, onClick: () => { navigate('/dashboard'); setSidebarOpen(false); } },
        { icon: Users, label: 'Clientes', onClick: () => { navigate('/clientes'); setSidebarOpen(false); } },
        { icon: CreditCard, label: 'Pagos', onClick: () => { navigate('/pagos'); setSidebarOpen(false); } },
        { icon: Calendar, label: 'Calendario', onClick: () => { navigate('/calendario'); setSidebarOpen(false); } },
        { icon: FileText, label: 'Reportes', onClick: () => { navigate('/reportes'); setSidebarOpen(false); } },
        { icon: Settings, label: 'Perfiles Internet', onClick: () => { navigate('/perfiles-internet'); setSidebarOpen(false); } },
        { icon: BarChart3, label: 'Estadísticas', onClick: () => { navigate('/estadisticas'); setSidebarOpen(false); } },
    ];

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
                        Cerrar Sesión
                    </motion.button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden w-full">
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
                                <span className="hidden sm:inline">Panel de </span>
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Control</span>
                            </h1>
                            <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">Bienvenido al sistema de gestión</p>
                        </div>

                        {/* 🔔 CAMPANA DE NOTIFICACIONES */}
                        <NotificationBell />
                    </div>
                </motion.header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
                        {[
                            { label: 'Total', fullLabel: 'Total Clientes', value: stats.total, icon: Users, gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50', trend: '+12%' },
                            { label: 'Activos', fullLabel: 'Activos', value: stats.activos, icon: UserCheck, gradient: 'from-green-500 to-emerald-500', bg: 'from-green-50 to-emerald-50', trend: '+8%' },
                            { label: 'Suspendidos', fullLabel: 'Suspendidos', value: stats.suspendidos, icon: UserX, gradient: 'from-orange-500 to-red-500', bg: 'from-orange-50 to-red-50', trend: '-3%' },
                            { label: 'Ingresos', fullLabel: 'Ingresos Mensuales', value: `S/ ${stats.ingresos.toFixed(0)}`, icon: DollarSign, gradient: 'from-purple-500 to-pink-500', bg: 'from-purple-50 to-pink-50', trend: '+15%' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className={`relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br ${stat.bg} p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-white/60`}
                            >
                                <div className="relative">
                                    <div className="flex items-start justify-between mb-2 lg:mb-4">
                                        <motion.div 
                                            whileHover={{ rotate: 360, scale: 1.1 }}
                                            transition={{ duration: 0.6 }}
                                            className={`w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                                        >
                                            <stat.icon className="text-white" size={20} />
                                        </motion.div>
                                        <div className="hidden lg:flex items-center gap-1 text-xs font-bold bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                                            <TrendingUp size={14} className="text-green-600" />
                                            <span className="text-green-600">{stat.trend}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs lg:text-sm font-semibold text-gray-600 mb-1">
                                        <span className="lg:hidden">{stat.label}</span>
                                        <span className="hidden lg:inline">{stat.fullLabel}</span>
                                    </p>
                                    <p className="text-xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/80 backdrop-blur-xl rounded-xl lg:rounded-2xl shadow-lg border border-red-100 p-4 lg:p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 lg:gap-3">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <AlertCircle className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm lg:text-base font-bold text-gray-900">Clientes con Deuda</h3>
                                        <p className="text-xs text-gray-500">Requieren atención</p>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={() => navigate('/clientes')}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                                >
                                    <ArrowRight size={18} className="text-red-600" />
                                </motion.button>
                            </div>
                            <div className="space-y-2 lg:space-y-3">
                                {clientesConDeuda.slice(0, 4).map((cliente) => (
                                    <div key={cliente.id} className="flex items-center justify-between p-2 lg:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs lg:text-sm font-semibold text-gray-900 truncate">{cliente.nombre} {cliente.apellido}</p>
                                            <p className="text-xs text-red-600">{cliente.meses_deuda} mes{cliente.meses_deuda !== 1 ? 'es' : ''}</p>
                                        </div>
                                        <span className="text-xs lg:text-sm font-bold text-red-600 ml-2">S/ {(cliente.precio_mensual * cliente.meses_deuda).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white/80 backdrop-blur-xl rounded-xl lg:rounded-2xl shadow-lg border border-yellow-100 p-4 lg:p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 lg:gap-3">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <Award className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm lg:text-base font-bold text-gray-900">Top Clientes</h3>
                                        <p className="text-xs text-gray-500">Por ingreso mensual</p>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={() => navigate('/clientes')}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                                >
                                    <ArrowRight size={18} className="text-yellow-600" />
                                </motion.button>
                            </div>
                            <div className="space-y-2 lg:space-y-3">
                                {topClientes.map((cliente, index) => (
                                    <div key={cliente.id} className="flex items-center justify-between p-2 lg:p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className="w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {index + 1}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs lg:text-sm font-semibold text-gray-900 truncate">{cliente.nombre} {cliente.apellido}</p>
                                                <p className="text-xs text-gray-500 truncate">{cliente.plan}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs lg:text-sm font-bold text-green-600 ml-2">S/ {cliente.precio_mensual}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white/80 backdrop-blur-xl rounded-xl lg:rounded-2xl shadow-lg border border-blue-100 p-4 lg:p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 lg:gap-3">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <Clock className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm lg:text-base font-bold text-gray-900">Actividad Reciente</h3>
                                        <p className="text-xs text-gray-500">Últimos clientes</p>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={() => navigate('/clientes')}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                                >
                                    <ArrowRight size={18} className="text-blue-600" />
                                </motion.button>
                            </div>
                            <div className="space-y-2 lg:space-y-3">
                                {actividadReciente.map((cliente) => (
                                    <div key={cliente.id} className="flex items-center justify-between p-2 lg:p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs lg:text-sm font-semibold text-gray-900 truncate">{cliente.nombre} {cliente.apellido}</p>
                                            <p className="text-xs text-gray-500 truncate">{cliente.tipo_servicio}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ml-2 flex-shrink-0 ${
                                            cliente.estado === 'activo' ? 'bg-green-100 text-green-800' :
                                            cliente.estado === 'suspendido' ? 'bg-orange-100 text-orange-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {cliente.estado.toUpperCase()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6"
                    >
                        {[
                            { label: 'Ver Clientes', fullLabel: 'Ver Todos los Clientes', icon: Users, gradient: 'from-blue-600 to-indigo-600', onClick: () => navigate('/clientes') },
                            { label: 'Pagos', fullLabel: 'Gestionar Pagos', icon: CreditCard, gradient: 'from-green-600 to-emerald-600', onClick: () => navigate('/pagos') },
                            { label: 'Reportes', fullLabel: 'Generar Reportes', icon: FileText, gradient: 'from-red-600 to-pink-600', onClick: () => navigate('/reportes') },
                            { label: 'Estadísticas', fullLabel: 'Ver Estadísticas', icon: BarChart3, gradient: 'from-purple-600 to-pink-600', onClick: () => navigate('/estadisticas') }
                        ].map((item, i) => (
                            <motion.button
                                key={i}
                                onClick={item.onClick}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className={`p-4 lg:p-6 bg-gradient-to-br ${item.gradient} rounded-xl lg:rounded-2xl shadow-lg text-white flex flex-col items-center gap-2 lg:gap-3`}
                            >
                                <item.icon size={24} className="lg:w-8 lg:h-8" />
                                <span className="text-xs lg:text-sm font-bold text-center">
                                    <span className="lg:hidden">{item.label}</span>
                                    <span className="hidden lg:inline">{item.fullLabel}</span>
                                </span>
                            </motion.button>
                        ))}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
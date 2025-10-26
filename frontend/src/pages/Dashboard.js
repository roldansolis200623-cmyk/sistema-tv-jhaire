import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, UserCheck, UserX, DollarSign,
    FileText, CreditCard, BarChart3, Settings,
    Home, LogOut, TrendingUp, AlertCircle,
    Clock, Award, ArrowRight, Calendar, Menu, X, Bell // ✅ Agregado Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clienteService } from '../services/api';
import NotificationBell from '../components/NotificationBell';
import notificacionService from '../services/notificacionInteligenteService'; // ✅ NUEVO

const Dashboard = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificacionesCount, setNotificacionesCount] = useState(0); // ✅ NUEVO
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const loadClientes = async () => {
        try {
            setLoading(true);
            const data = await clienteService.getAll();
            setClientes(data);
        } catch (error) {
            console.error('Error cargando clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ NUEVO: Cargar contador de notificaciones
    const cargarContadorNotificaciones = async () => {
        try {
            const resumen = await notificacionService.obtenerResumen();
            setNotificacionesCount(resumen.no_leidas || 0);
        } catch (error) {
            console.error('Error cargando contador de notificaciones:', error);
            setNotificacionesCount(0);
        }
    };

    useEffect(() => {
        let mounted = true;
        if (mounted) {
            loadClientes();
            cargarContadorNotificaciones(); // ✅ Cargar notificaciones al inicio
        }
        
        // ✅ Actualizar contador cada 5 minutos
        const interval = setInterval(() => {
            if (mounted) {
                cargarContadorNotificaciones();
            }
        }, 5 * 60 * 1000);
        
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

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
        { 
            icon: Bell, 
            label: 'Notificaciones', 
            badge: notificacionesCount, // ✅ NUEVO: Badge con contador
            onClick: () => { navigate('/notificaciones-inteligentes'); setSidebarOpen(false); } 
        }, // ✅ NUEVO ITEM
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
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                                item.active
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                                    : 'text-gray-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                            {/* ✅ NUEVO: Badge de notificaciones */}
                            {item.badge && item.badge > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                                    style={{
                                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                    }}
                                >
                                    {item.badge > 99 ? '99+' : item.badge}
                                </motion.span>
                            )}
                        </motion.button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                            {user?.usuario ? user.usuario.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user?.usuario || 'Admin'}</p>
                            <p className="text-xs text-gray-400">Administrador</p>
                        </div>
                    </div>
                    <motion.button
                        onClick={handleLogout}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                        <LogOut size={18} />
                        Cerrar Sesión
                    </motion.button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm sticky top-0 z-30">
                    <div className="px-4 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Menu size={24} className="text-gray-700" />
                                </button>
                                <div>
                                    <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                                        Panel de Control
                                    </h1>
                                    <p className="text-xs lg:text-sm text-gray-500">
                                        Bienvenido, {user?.usuario || 'Admin'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <NotificationBell />
                                {/* ✅ NUEVO: Botón rápido a notificaciones */}
                                <motion.button
                                    onClick={() => navigate('/notificaciones-inteligentes')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all relative"
                                >
                                    <Bell size={18} />
                                    <span>Notificaciones</span>
                                    {notificacionesCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                                            {notificacionesCount > 99 ? '99+' : notificacionesCount}
                                        </span>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
                            />
                        </div>
                    ) : (
                        <>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl shadow-xl p-4 lg:p-6 text-white"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                            <Users size={20} className="lg:w-6 lg:h-6" />
                                        </div>
                                        <TrendingUp size={18} className="lg:w-5 lg:h-5 opacity-70" />
                                    </div>
                                    <p className="text-xs lg:text-sm opacity-90 mb-1">Total Clientes</p>
                                    <p className="text-2xl lg:text-4xl font-bold">{stats.total}</p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl lg:rounded-2xl shadow-xl p-4 lg:p-6 text-white"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                            <UserCheck size={20} className="lg:w-6 lg:h-6" />
                                        </div>
                                        <TrendingUp size={18} className="lg:w-5 lg:h-5 opacity-70" />
                                    </div>
                                    <p className="text-xs lg:text-sm opacity-90 mb-1">Clientes Activos</p>
                                    <p className="text-2xl lg:text-4xl font-bold">{stats.activos}</p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl lg:rounded-2xl shadow-xl p-4 lg:p-6 text-white"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                            <UserX size={20} className="lg:w-6 lg:h-6" />
                                        </div>
                                        <AlertCircle size={18} className="lg:w-5 lg:h-5 opacity-70" />
                                    </div>
                                    <p className="text-xs lg:text-sm opacity-90 mb-1">Suspendidos</p>
                                    <p className="text-2xl lg:text-4xl font-bold">{stats.suspendidos}</p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl lg:rounded-2xl shadow-xl p-4 lg:p-6 text-white"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                            <DollarSign size={20} className="lg:w-6 lg:h-6" />
                                        </div>
                                        <TrendingUp size={18} className="lg:w-5 lg:h-5 opacity-70" />
                                    </div>
                                    <p className="text-xs lg:text-sm opacity-90 mb-1">Ingresos Mensuales</p>
                                    <p className="text-xl lg:text-3xl font-bold">S/ {stats.ingresos.toFixed(2)}</p>
                                </motion.div>
                            </motion.div>

                            <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
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
                                                <p className="text-xs text-gray-500">{clientesConDeuda.length} clientes</p>
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
                                    <div className="space-y-2 lg:space-y-3 max-h-60 overflow-y-auto">
                                        {clientesConDeuda.length === 0 ? (
                                            <p className="text-center text-gray-500 py-4">No hay clientes con deuda</p>
                                        ) : (
                                            clientesConDeuda.slice(0, 5).map((cliente) => (
                                                <div key={cliente.id} className="flex items-center justify-between p-2 lg:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs lg:text-sm font-semibold text-gray-900 truncate">{cliente.nombre} {cliente.apellido}</p>
                                                        <p className="text-xs text-red-600">{cliente.meses_deuda} mes{cliente.meses_deuda !== 1 ? 'es' : ''}</p>
                                                    </div>
                                                    <span className="text-xs lg:text-sm font-bold text-red-600 ml-2">S/ {(cliente.precio_mensual * cliente.meses_deuda).toFixed(2)}</span>
                                                </div>
                                            ))
                                        )}
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
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
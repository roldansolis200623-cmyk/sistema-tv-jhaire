import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PieChart, Pie, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell 
} from 'recharts';
import { 
    Users, TrendingUp, DollarSign, AlertCircle, 
    Activity, Target, Award, Calendar, Clock, 
    TrendingDown, Home, LogOut, CreditCard, FileText,
    BarChart3, Settings, Bell, Menu, X
} from 'lucide-react';
import { clienteService } from '../services/api';
import pagoService from '../services/pagoService';

const useAuth = () => {
    const logout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };
    
    return {
        user: { nombre_completo: localStorage.getItem('userName') || 'Admin' },
        logout
    };
};

const AnimatedNumber = ({ value, suffix = '', decimals = 0, duration = 2000 }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime;
        let animationFrame;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = value * easeOutQuart;
            
            setDisplayValue(currentValue);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    const formattedValue = decimals > 0 
        ? displayValue.toFixed(decimals)
        : Math.floor(displayValue);

    return <>{formattedValue}{suffix}</>;
};

const EstadisticasView = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [clientesData, pagosData] = await Promise.all([
                clienteService.getAll(),
                pagoService.getAll()
            ]);
            
            let pagosConClientes = pagosData;
            
            if (pagosData.length > 0 && !pagosData[0].cliente && pagosData[0].cliente_id) {
                const clienteMap = {};
                clientesData.forEach(c => {
                    clienteMap[c.id] = c;
                });
                
                pagosConClientes = pagosData.map(pago => ({
                    ...pago,
                    cliente: clienteMap[pago.cliente_id] || {
                        nombre: 'Desconocido',
                        apellido: '',
                        dni: 'N/A'
                    }
                }));
            }
            
            setClientes(clientesData);
            setPagos(pagosConClientes);
            
        } catch (error) {
            console.error('Error cargando datos:', error);
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
        { icon: FileText, label: 'Reportes', onClick: () => { navigate('/reportes'); setSidebarOpen(false); } },
        { icon: Settings, label: 'Perfiles Internet', onClick: () => { navigate('/perfiles-internet'); setSidebarOpen(false); } },
        { icon: BarChart3, label: 'Estadísticas', active: true },
    ];

    const stats = {
        total: clientes.length,
        activos: clientes.filter(c => c.estado === 'activo').length,
        suspendidos: clientes.filter(c => c.estado === 'suspendido').length,
        deudores: clientes.filter(c => (c.meses_deuda || 0) > 0).length,
        ingresosPotenciales: clientes.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0),
        ingresosActivos: clientes.filter(c => c.estado === 'activo').reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0),
        totalIngresosReales: pagos.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0),
        totalPagosRegistrados: pagos.length,
        promedioIngresosPorPago: pagos.length > 0 
            ? (pagos.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0) / pagos.length)
            : 0,
        tasaCobranza: clientes.length > 0 ? ((clientes.filter(c => (c.meses_deuda || 0) === 0).length / clientes.length) * 100).toFixed(1) : 0,
        promedioDeuda: clientes.filter(c => c.meses_deuda > 0).length > 0 
            ? (clientes.filter(c => c.meses_deuda > 0).reduce((sum, c) => sum + c.meses_deuda, 0) / clientes.filter(c => c.meses_deuda > 0).length).toFixed(1)
            : 0,
        deudaTotal: clientes.reduce((sum, c) => sum + ((c.precio_mensual || 0) * (c.meses_deuda || 0)), 0)
    };

    const calcularIngresosPorMes = () => {
        const ingresosPorMes = {};
        
        pagos.forEach(pago => {
            const fecha = new Date(pago.fecha_pago || pago.fecha);
            const mesAno = `${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
            ingresosPorMes[mesAno] = (ingresosPorMes[mesAno] || 0) + parseFloat(pago.monto || 0);
        });
        
        const resultado = [];
        const hoy = new Date();
        for (let i = 5; i >= 0; i--) {
            const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
            const mesAno = `${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
            const mesNombre = fecha.toLocaleDateString('es-PE', { month: 'short' });
            
            resultado.push({
                mes: mesNombre,
                ingresos: ingresosPorMes[mesAno] || 0
            });
        }
        
        return resultado;
    };

    const datosMensuales = calcularIngresosPorMes();

    const pagosRecientes = [...pagos]
        .sort((a, b) => new Date(b.fecha_pago || b.fecha) - new Date(a.fecha_pago || a.fecha))
        .slice(0, 10);

    const datosEstados = [
        { name: 'Activos', value: stats.activos, color: '#10b981' },
        { name: 'Suspendidos', value: stats.suspendidos, color: '#f59e0b' },
        { name: 'Inactivos', value: clientes.filter(c => c.estado === 'inactivo').length, color: '#ef4444' }
    ].filter(d => d.value > 0);

    const datosServicios = Object.entries(
        clientes.reduce((acc, c) => {
            const servicio = c.tipo_servicio || 'Sin definir';
            acc[servicio] = (acc[servicio] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    const topDeudores = clientes
        .filter(c => (c.meses_deuda || 0) > 0)
        .map(c => ({ ...c, deudaTotal: (c.precio_mensual || 0) * (c.meses_deuda || 0) }))
        .sort((a, b) => b.deudaTotal - a.deudaTotal)
        .slice(0, 5);

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
                <header className="bg-white/80 backdrop-blur-xl border-b border-indigo-100 px-4 lg:px-8 py-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                            <Menu size={24} className="text-gray-700" />
                        </button>

                        <div className="flex-1">
                            <h1 className="text-lg lg:text-2xl font-bold text-gray-900">
                                <span className="hidden sm:inline">Estadísticas y </span>
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Análisis</span>
                            </h1>
                            <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">Visualiza métricas y reportes del negocio</p>
                        </div>
                    </div>
                </header>

                {/* CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
                            {/* TABS RESPONSIVE */}
                            <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 mb-4 lg:mb-6">
                                {[
                                    { id: 'general', label: 'General', icon: BarChart3 },
                                    { id: 'deudores', label: 'Deudores', icon: AlertCircle },
                                    { id: 'ingresos', label: 'Ingresos', icon: DollarSign }
                                ].map((tab) => (
                                    <motion.button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`flex items-center justify-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-semibold transition-all text-sm lg:text-base ${
                                            activeTab === tab.id 
                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                        }`}
                                    >
                                        <tab.icon size={18} />
                                        {tab.label}
                                    </motion.button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'general' && (
                                    <motion.div 
                                        key="general"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* STATS CARDS RESPONSIVE */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-6">
                                            <StatCard 
                                                icon={Users} 
                                                label="Total Clientes" 
                                                value={stats.total}
                                                gradient="from-blue-500 to-cyan-500"
                                                delay={0}
                                            />
                                            <StatCard 
                                                icon={Activity} 
                                                label="Activos" 
                                                value={stats.activos}
                                                gradient="from-green-500 to-emerald-500"
                                                delay={0.1}
                                            />
                                            <StatCard 
                                                icon={AlertCircle} 
                                                label="Suspendidos" 
                                                value={stats.suspendidos}
                                                gradient="from-orange-500 to-amber-500"
                                                delay={0.2}
                                            />
                                            <StatCard 
                                                icon={Target} 
                                                label="Tasa Cobranza" 
                                                value={stats.tasaCobranza}
                                                suffix="%"
                                                gradient="from-purple-500 to-pink-500"
                                                delay={0.3}
                                            />
                                        </div>

                                        {/* BIG CARDS RESPONSIVE */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
                                            <BigStatCard 
                                                icon={DollarSign}
                                                label="Ingresos Potenciales"
                                                value={stats.ingresosPotenciales}
                                                prefix="S/ "
                                                gradient="from-indigo-500 to-blue-500"
                                                delay={0.4}
                                            />
                                            <BigStatCard 
                                                icon={TrendingUp}
                                                label="Ingresos Activos"
                                                value={stats.ingresosActivos}
                                                prefix="S/ "
                                                gradient="from-teal-500 to-green-500"
                                                delay={0.5}
                                            />
                                        </div>

                                        {/* CHARTS RESPONSIVE */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
                                            {datosEstados.length > 0 && (
                                                <ChartCard title="Estados de Clientes">
                                                    <ResponsiveContainer width="100%" height={250}>
                                                        <PieChart>
                                                            <Pie 
                                                                data={datosEstados} 
                                                                cx="50%" 
                                                                cy="50%" 
                                                                outerRadius={80} 
                                                                dataKey="value"
                                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                            >
                                                                {datosEstados.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </ChartCard>
                                            )}

                                            {datosServicios.length > 0 && (
                                                <ChartCard title="Distribución de Servicios">
                                                    <ResponsiveContainer width="100%" height={250}>
                                                        <BarChart data={datosServicios}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                            <XAxis dataKey="name" fontSize={11} />
                                                            <YAxis fontSize={11} />
                                                            <Tooltip />
                                                            <Bar dataKey="value" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
                                                            <defs>
                                                                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#8b5cf6" />
                                                                    <stop offset="100%" stopColor="#3b82f6" />
                                                                </linearGradient>
                                                            </defs>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </ChartCard>
                                            )}
                                        </div>

                                        {/* TENDENCIA RESPONSIVE */}
                                        <ChartCard title="Tendencia de Ingresos (Últimos 6 Meses)">
                                            <ResponsiveContainer width="100%" height={220}>
                                                <LineChart data={datosMensuales}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    <XAxis dataKey="mes" fontSize={11} />
                                                    <YAxis fontSize={11} />
                                                    <Tooltip />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="ingresos" 
                                                        stroke="#10b981" 
                                                        strokeWidth={3}
                                                        dot={{ fill: '#10b981', r: 4 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </ChartCard>
                                    </motion.div>
                                )}

                                {activeTab === 'deudores' && (
                                    <motion.div 
                                        key="deudores"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
                                            <BigStatCard 
                                                icon={AlertCircle}
                                                label="Total Deudores"
                                                value={stats.deudores}
                                                gradient="from-red-500 to-orange-500"
                                                delay={0}
                                            />
                                            <BigStatCard 
                                                icon={TrendingDown}
                                                label="Promedio Meses"
                                                value={stats.promedioDeuda}
                                                suffix=" meses"
                                                gradient="from-orange-500 to-yellow-500"
                                                delay={0.1}
                                            />
                                            <BigStatCard 
                                                icon={DollarSign}
                                                label="Deuda Total"
                                                value={stats.deudaTotal}
                                                prefix="S/ "
                                                gradient="from-pink-500 to-red-500"
                                                delay={0.2}
                                            />
                                        </div>

                                        {topDeudores.length > 0 ? (
                                            <motion.div 
                                                className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <h3 className="text-lg lg:text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                                                    <Award className="text-yellow-500" size={24} />
                                                    Top 5 Deudores
                                                </h3>
                                                <div className="space-y-3">
                                                    {topDeudores.map((cliente, index) => (
                                                        <motion.div
                                                            key={cliente.id}
                                                            className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 transition-all"
                                                            initial={{ x: -50, opacity: 0 }}
                                                            animate={{ x: 0, opacity: 1 }}
                                                            transition={{ delay: 0.4 + index * 0.1 }}
                                                            whileHover={{ scale: 1.01 }}
                                                        >
                                                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-base lg:text-lg flex-shrink-0">
                                                                {index + 1}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold text-gray-900 text-sm lg:text-base truncate">
                                                                    {cliente.nombre} {cliente.apellido}
                                                                </div>
                                                                <div className="text-xs lg:text-sm text-gray-600 flex items-center gap-1">
                                                                    <Clock size={14} />
                                                                    {cliente.meses_deuda} {cliente.meses_deuda === 1 ? 'mes' : 'meses'}
                                                                </div>
                                                            </div>
                                                            <div className="text-lg lg:text-2xl font-bold text-red-600 flex-shrink-0">
                                                                S/ {cliente.deudaTotal.toFixed(2)}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                                <p className="text-xl text-gray-500">No hay clientes con deudas</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'ingresos' && (
                                    <motion.div 
                                        key="ingresos"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
                                            <BigStatCard 
                                                icon={DollarSign}
                                                label="Total Recaudado"
                                                value={stats.totalIngresosReales}
                                                prefix="S/ "
                                                gradient="from-green-500 to-emerald-500"
                                                delay={0}
                                            />
                                            <BigStatCard 
                                                icon={FileText}
                                                label="Total de Pagos"
                                                value={stats.totalPagosRegistrados}
                                                gradient="from-blue-500 to-cyan-500"
                                                delay={0.1}
                                            />
                                            <BigStatCard 
                                                icon={TrendingUp}
                                                label="Promedio por Pago"
                                                value={stats.promedioIngresosPorPago}
                                                prefix="S/ "
                                                gradient="from-purple-500 to-pink-500"
                                                delay={0.2}
                                            />
                                        </div>

                                        <motion.div 
                                            className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <h3 className="text-lg lg:text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                                                <Calendar className="text-green-500" size={24} />
                                                Pagos Recientes ({pagosRecientes.length})
                                            </h3>
                                            <div className="space-y-3">
                                                {pagosRecientes.length === 0 ? (
                                                    <p className="text-center text-gray-500 py-8">No hay pagos registrados</p>
                                                ) : (
                                                    pagosRecientes.map((pago, index) => (
                                                        <motion.div
                                                            key={pago.id}
                                                            className="flex items-center justify-between p-3 lg:p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all"
                                                            initial={{ x: -50, opacity: 0 }}
                                                            animate={{ x: 0, opacity: 1 }}
                                                            transition={{ delay: 0.4 + index * 0.05 }}
                                                            whileHover={{ scale: 1.01 }}
                                                        >
                                                            <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                                                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                                    {index + 1}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-bold text-gray-900 text-sm lg:text-base truncate">
                                                                        {pago.cliente?.nombre || 'Desconocido'} {pago.cliente?.apellido || ''}
                                                                    </div>
                                                                    <div className="text-xs lg:text-sm text-gray-600 flex items-center gap-1">
                                                                        <Calendar size={14} />
                                                                        {new Date(pago.fecha_pago || pago.fecha).toLocaleDateString('es-PE')}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <div className="text-lg lg:text-2xl font-bold text-green-600">
                                                                    S/ {parseFloat(pago.monto).toFixed(2)}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {pago.meses_pagados || 1} {pago.meses_pagados === 1 ? 'mes' : 'meses'}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, suffix = '', gradient, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6 relative overflow-hidden"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
        <div className="relative">
            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-lg`}>
                <Icon className="text-white" size={20} />
            </div>
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">{label}</p>
            <p className={`text-2xl lg:text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                <AnimatedNumber value={value} suffix={suffix} />
            </p>
        </div>
    </motion.div>
);

const BigStatCard = ({ icon: Icon, label, value, prefix = '', suffix = '', gradient, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -5, scale: 1.01 }}
        className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 relative overflow-hidden"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
        <div className="relative">
            <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="text-white" size={24} />
            </div>
            <p className="text-xs lg:text-sm font-semibold text-gray-600 uppercase mb-2">{label}</p>
            <p className={`text-3xl lg:text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {prefix}<AnimatedNumber value={value} decimals={2} />{suffix}
            </p>
        </div>
    </motion.div>
);

const ChartCard = ({ title, children }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -3 }}
        className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6"
    >
        <h3 className="text-base lg:text-lg font-bold mb-4 text-gray-900">{title}</h3>
        {children}
    </motion.div>
);

export default EstadisticasView;
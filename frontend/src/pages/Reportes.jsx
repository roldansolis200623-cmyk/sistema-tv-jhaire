import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, Download, Home, LogOut, Users, CreditCard,
    BarChart3, Settings, Bell, Menu, X, Calendar, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Reportes = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleDescargarPDF = async (tipo) => {
        setLoading({ ...loading, [tipo]: true });
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://sistema-tv-jhaire-production-1248.up.railway.app'}/api/reportes/pdf/${tipo}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error('Error al generar el reporte');
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            // DETECTAR SI ES MÓVIL
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            if (isMobile) {
                // EN MÓVIL: Abrir en nueva pestaña
                window.open(url, '_blank');
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            } else {
                // EN DESKTOP: Descargar directamente
                const link = document.createElement('a');
                link.href = url;
                link.download = `reporte_${tipo}_${Date.now()}.pdf`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);
            }
            
        } catch (error) {
            console.error('Error descargando PDF:', error);
            alert('Error al generar el reporte');
        } finally {
            setLoading({ ...loading, [tipo]: false });
        }
    };

    const handleDescargarPDFServicio = async (tipoServicio) => {
        setLoading({ ...loading, [tipoServicio]: true });
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://sistema-tv-jhaire-production-1248.up.railway.app'}/api/reportes/pdf/servicio/${encodeURIComponent(tipoServicio)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error('Error al generar el reporte');
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            // DETECTAR SI ES MÓVIL
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            if (isMobile) {
                // EN MÓVIL: Abrir en nueva pestaña
                window.open(url, '_blank');
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            } else {
                // EN DESKTOP: Descargar directamente
                const link = document.createElement('a');
                link.href = url;
                link.download = `reporte_${tipoServicio.toLowerCase().replace(/ /g, '_')}_${Date.now()}.pdf`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);
            }
            
        } catch (error) {
            console.error('Error descargando PDF:', error);
            alert('Error al generar el reporte');
        } finally {
            setLoading({ ...loading, [tipoServicio]: false });
        }
    };

    const handleDescargarPDFSenal = async (tipoSenal) => {
        setLoading({ ...loading, [tipoSenal]: true });
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://sistema-tv-jhaire-production-1248.up.railway.app'}/api/reportes/pdf/senal/${encodeURIComponent(tipoSenal)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error('Error al generar el reporte');
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            // DETECTAR SI ES MÓVIL
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            if (isMobile) {
                // EN MÓVIL: Abrir en nueva pestaña
                window.open(url, '_blank');
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            } else {
                // EN DESKTOP: Descargar directamente
                const link = document.createElement('a');
                link.href = url;
                link.download = `reporte_senal_${tipoSenal.toLowerCase()}_${Date.now()}.pdf`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);
            }
            
        } catch (error) {
            console.error('Error descargando PDF:', error);
            alert('Error al generar el reporte');
        } finally {
            setLoading({ ...loading, [tipoSenal]: false });
        }
    };

    const handleExportarExcel = async () => {
        setLoading({ ...loading, excel: true });
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://sistema-tv-jhaire-production-1248.up.railway.app'}/api/reportes/exportar-excel`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error('Error al exportar');
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            // DETECTAR SI ES MÓVIL
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            if (isMobile) {
                // EN MÓVIL: Abrir en nueva pestaña
                window.open(url, '_blank');
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            } else {
                // EN DESKTOP: Descargar directamente
                const link = document.createElement('a');
                link.href = url;
                link.download = `clientes_${Date.now()}.xlsx`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);
            }
            
        } catch (error) {
            console.error('Error exportando Excel:', error);
            alert('Error al exportar a Excel');
        } finally {
            setLoading({ ...loading, excel: false });
        }
    };

    const menuItems = [
        { icon: Home, label: 'Dashboard', onClick: () => { navigate('/dashboard'); setSidebarOpen(false); } },
        { icon: Users, label: 'Clientes', onClick: () => { navigate('/clientes'); setSidebarOpen(false); } },
        { icon: CreditCard, label: 'Pagos', onClick: () => { navigate('/pagos'); setSidebarOpen(false); } },
        { icon: Calendar, label: 'Calendario', onClick: () => { navigate('/calendario'); setSidebarOpen(false); } },
        { icon: AlertTriangle, label: 'Incidencias', onClick: () => { navigate('/incidencias'); setSidebarOpen(false); } },
        { icon: FileText, label: 'Reportes', active: true },
        { icon: Settings, label: 'Perfiles Internet', onClick: () => { navigate('/perfiles-internet'); setSidebarOpen(false); } },
        { icon: BarChart3, label: 'Estadísticas', onClick: () => { navigate('/estadisticas'); setSidebarOpen(false); } },
    ];

    const reportes = [
        {
            categoria: 'Reportes Generales',
            items: [
                { 
                    nombre: 'Reporte General', 
                    descripcion: 'Todos los clientes y sus servicios', 
                    tipo: 'general',
                    bgGradient: 'from-blue-50 to-blue-100',
                    iconGradient: 'from-blue-500 to-blue-600',
                    textColor: 'text-blue-600',
                    borderColor: 'border-blue-200',
                    hoverBg: 'hover:bg-blue-50',
                    loadingBorder: 'border-blue-600'
                },
                { 
                    nombre: 'Deudores y Morosos', 
                    descripcion: 'Clientes con pagos pendientes', 
                    tipo: 'deudores',
                    bgGradient: 'from-red-50 to-red-100',
                    iconGradient: 'from-red-500 to-red-600',
                    textColor: 'text-red-600',
                    borderColor: 'border-red-200',
                    hoverBg: 'hover:bg-red-50',
                    loadingBorder: 'border-red-600'
                }
            ]
        },
        {
            categoria: 'Reportes por Servicio',
            items: [
                { 
                    nombre: 'Solo Internet', 
                    descripcion: 'Clientes con servicio de internet', 
                    tipo: 'Solo Internet',
                    bgGradient: 'from-cyan-50 to-cyan-100',
                    iconGradient: 'from-cyan-500 to-cyan-600',
                    textColor: 'text-cyan-600',
                    borderColor: 'border-cyan-200',
                    hoverBg: 'hover:bg-cyan-50',
                    loadingBorder: 'border-cyan-600',
                    esServicio: true 
                },
                { 
                    nombre: 'Solo Cable', 
                    descripcion: 'Clientes con servicio de cable', 
                    tipo: 'Solo Cable',
                    bgGradient: 'from-purple-50 to-purple-100',
                    iconGradient: 'from-purple-500 to-purple-600',
                    textColor: 'text-purple-600',
                    borderColor: 'border-purple-200',
                    hoverBg: 'hover:bg-purple-50',
                    loadingBorder: 'border-purple-600',
                    esServicio: true 
                },
                { 
                    nombre: 'Dúo (Internet + Cable)', 
                    descripcion: 'Clientes con servicio combinado', 
                    tipo: 'Dúo',
                    bgGradient: 'from-green-50 to-green-100',
                    iconGradient: 'from-green-500 to-green-600',
                    textColor: 'text-green-600',
                    borderColor: 'border-green-200',
                    hoverBg: 'hover:bg-green-50',
                    loadingBorder: 'border-green-600',
                    esServicio: true 
                }
            ]
        },
        {
            categoria: 'Reportes por Señal',
            items: [
                { 
                    nombre: 'Señal Analógica', 
                    descripcion: 'Clientes con señal analógica', 
                    tipo: 'Analógica',
                    bgGradient: 'from-orange-50 to-orange-100',
                    iconGradient: 'from-orange-500 to-orange-600',
                    textColor: 'text-orange-600',
                    borderColor: 'border-orange-200',
                    hoverBg: 'hover:bg-orange-50',
                    loadingBorder: 'border-orange-600',
                    esSenal: true 
                },
                { 
                    nombre: 'Señal Digital', 
                    descripcion: 'Clientes con señal digital', 
                    tipo: 'Digital',
                    bgGradient: 'from-indigo-50 to-indigo-100',
                    iconGradient: 'from-indigo-500 to-indigo-600',
                    textColor: 'text-indigo-600',
                    borderColor: 'border-indigo-200',
                    hoverBg: 'hover:bg-indigo-50',
                    loadingBorder: 'border-indigo-600',
                    esSenal: true 
                },
                { 
                    nombre: 'Señal Mixta', 
                    descripcion: 'Clientes con señal mixta', 
                    tipo: 'Mixta',
                    bgGradient: 'from-pink-50 to-pink-100',
                    iconGradient: 'from-pink-500 to-pink-600',
                    textColor: 'text-pink-600',
                    borderColor: 'border-pink-200',
                    hoverBg: 'hover:bg-pink-50',
                    loadingBorder: 'border-pink-600',
                    esSenal: true 
                }
            ]
        }
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
                                <span className="hidden sm:inline">Generación de </span>
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Reportes</span>
                            </h1>
                            <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">Exporta y descarga reportes en PDF y Excel</p>
                        </div>
                    </div>
                </motion.header>

                {/* CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {/* EXCEL EXPORT RESPONSIVE */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl lg:rounded-2xl p-6 lg:p-8 mb-6 lg:mb-8 shadow-2xl"
                    >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 lg:gap-4">
                                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-xl rounded-xl lg:rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Download className="text-white" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl lg:text-2xl font-bold text-white mb-1">Exportar a Excel</h2>
                                    <p className="text-sm lg:text-base text-emerald-100">Descarga todos los datos en Excel</p>
                                </div>
                            </div>
                            <motion.button
                                onClick={handleExportarExcel}
                                disabled={loading.excel}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full lg:w-auto px-6 lg:px-8 py-3 lg:py-4 bg-white text-emerald-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-sm lg:text-base"
                            >
                                {loading.excel ? 'Descargando...' : 'Descargar Excel'}
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* PDF REPORTS RESPONSIVE */}
                    {reportes.map((categoria, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="mb-6 lg:mb-8"
                        >
                            <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">{categoria.categoria}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                                {categoria.items.map((reporte, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: (idx * 0.1) + (i * 0.05) }}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        className={`bg-gradient-to-br ${reporte.bgGradient} rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg border ${reporte.borderColor} cursor-pointer`}
                                    >
                                        <div className="flex items-start justify-between mb-3 lg:mb-4">
                                            <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${reporte.iconGradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                                                <FileText className="text-white" size={22} />
                                            </div>
                                            <motion.button
                                                onClick={() => {
                                                    if (reporte.esServicio) {
                                                        handleDescargarPDFServicio(reporte.tipo);
                                                    } else if (reporte.esSenal) {
                                                        handleDescargarPDFSenal(reporte.tipo);
                                                    } else {
                                                        handleDescargarPDF(reporte.tipo);
                                                    }
                                                }}
                                                disabled={loading[reporte.tipo]}
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                whileTap={{ scale: 0.9 }}
                                                className={`p-2.5 lg:p-3 bg-white ${reporte.hoverBg} rounded-lg shadow-md transition-all disabled:opacity-50`}
                                            >
                                                {loading[reporte.tipo] ? (
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        className={`w-5 h-5 border-2 ${reporte.loadingBorder} border-t-transparent rounded-full`}
                                                    />
                                                ) : (
                                                    <Download className={reporte.textColor} size={20} />
                                                )}
                                            </motion.button>
                                        </div>
                                        <h4 className="text-base lg:text-lg font-bold text-gray-900 mb-1">{reporte.nombre}</h4>
                                        <p className="text-sm text-gray-600">{reporte.descripcion}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </main>
            </div>
        </div>
    );
};

export default Reportes;
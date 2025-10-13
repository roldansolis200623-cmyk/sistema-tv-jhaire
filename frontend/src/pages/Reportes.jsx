import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    FileText, Download, Home, LogOut, Users, CreditCard,
    BarChart3, Settings, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Reportes = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState({});

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleDescargarPDF = async (tipo) => {
        setLoading({ ...loading, [tipo]: true });
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/reportes/pdf/${tipo}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error('Error al generar el reporte');
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
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
            
        } catch (error) {
            console.error('Error descargando PDF:', error);
        } finally {
            setLoading({ ...loading, [tipo]: false });
        }
    };

    const handleDescargarPDFServicio = async (tipoServicio) => {
        setLoading({ ...loading, [tipoServicio]: true });
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/reportes/pdf/servicio/${encodeURIComponent(tipoServicio)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error('Error al generar el reporte');
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
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
            
        } catch (error) {
            console.error('Error descargando PDF:', error);
        } finally {
            setLoading({ ...loading, [tipoServicio]: false });
        }
    };

    const handleDescargarPDFSenal = async (tipoSenal) => {
        setLoading({ ...loading, [tipoSenal]: true });
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/reportes/pdf/senal/${encodeURIComponent(tipoSenal)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error('Error al generar el reporte');
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
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
            
        } catch (error) {
            console.error('Error descargando PDF:', error);
        } finally {
            setLoading({ ...loading, [tipoSenal]: false });
        }
    };

    const handleExportarExcel = async () => {
        setLoading({ ...loading, excel: true });
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/reportes/exportar-excel', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error('Error al exportar');
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
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
            
        } catch (error) {
            console.error('Error exportando Excel:', error);
        } finally {
            setLoading({ ...loading, excel: false });
        }
    };

    const menuItems = [
        { icon: Home, label: 'Dashboard', onClick: () => navigate('/dashboard') },
        { icon: Users, label: 'Clientes', onClick: () => navigate('/clientes') },
        { icon: CreditCard, label: 'Pagos', onClick: () => navigate('/pagos') },
        { icon: FileText, label: 'Reportes', active: true },
        { icon: Settings, label: 'Perfiles Internet', onClick: () => navigate('/perfiles-internet') },
        { icon: BarChart3, label: 'Estadísticas', onClick: () => navigate('/estadisticas') },
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
                                Generación de <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Reportes</span>
                            </h1>
                            <p className="text-sm text-gray-600">Exporta y descarga reportes en PDF y Excel</p>
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="relative p-2 bg-gradient-to-br from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 rounded-xl transition-all"
                        >
                            <Bell size={20} className="text-indigo-600" />
                        </motion.button>
                    </div>
                </motion.header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    {/* Excel Export */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 mb-8 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                                    <Download className="text-white" size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">Exportar a Excel</h2>
                                    <p className="text-emerald-100">Descarga todos los datos de clientes en formato Excel</p>
                                </div>
                            </div>
                            <motion.button
                                onClick={handleExportarExcel}
                                disabled={loading.excel}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                {loading.excel ? 'Descargando...' : 'Descargar Excel'}
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* PDF Reports */}
                    {reportes.map((categoria, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="mb-8"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{categoria.categoria}</h3>
                            <div className="grid grid-cols-3 gap-6">
                                {categoria.items.map((reporte, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: (idx * 0.1) + (i * 0.05) }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        className={`bg-gradient-to-br ${reporte.bgGradient} rounded-2xl p-6 shadow-lg border ${reporte.borderColor} cursor-pointer`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-14 h-14 bg-gradient-to-br ${reporte.iconGradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                                <FileText className="text-white" size={26} />
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
                                                className={`p-3 bg-white ${reporte.hoverBg} rounded-lg shadow-md transition-all disabled:opacity-50`}
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
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">{reporte.nombre}</h4>
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
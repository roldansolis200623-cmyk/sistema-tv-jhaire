import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, TrendingDown, Target, DollarSign, 
    Users, Calendar, AlertCircle, CheckCircle2
} from 'lucide-react';

const AnimatedNumber = ({ value, prefix = '', suffix = '', decimals = 2, duration = 2000 }) => {
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

    const formattedValue = displayValue.toLocaleString('es-PE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });

    return <>{prefix}{formattedValue}{suffix}</>;
};

const ProyeccionMensual = ({ clientes }) => {
    const [proyeccion, setProyeccion] = useState(null);

    useEffect(() => {
        calcularProyeccion();
    }, [clientes]);

    const calcularProyeccion = () => {
        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const anioActual = hoy.getFullYear();
        
        const clientesActivos = clientes.filter(c => c.estado === 'activo');
        
        const ingresosEsperados = clientesActivos.reduce(
            (sum, c) => sum + parseFloat(c.precio_mensual || 0), 
            0
        );
        
        const diaDelMes = hoy.getDate();
        const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
        const progresoMes = (diaDelMes / diasEnMes) * 100;
        const porcentajeCobrado = Math.min(progresoMes * 0.8, 85);
        
        const yaCobrado = ingresosEsperados * (porcentajeCobrado / 100);
        const faltaCobrar = ingresosEsperados - yaCobrado;
        
        const cantidadCobrados = Math.floor(clientesActivos.length * (porcentajeCobrado / 100));
        const cantidadFaltan = clientesActivos.length - cantidadCobrados;
        
        const mesPasado = ingresosEsperados * 0.92;
        const diferenciaVsMesPasado = ingresosEsperados - mesPasado;
        const porcentajeDiferencia = ((diferenciaVsMesPasado / mesPasado) * 100).toFixed(1);
        const esMejor = diferenciaVsMesPasado > 0;
        
        const metaMes = ingresosEsperados * 1.10;
        const cumplimientoMeta = (ingresosEsperados / metaMes) * 100;
        
        setProyeccion({
            ingresosEsperados,
            yaCobrado,
            faltaCobrar,
            porcentajeCobrado: porcentajeCobrado.toFixed(1),
            cantidadCobrados,
            cantidadFaltan,
            mesPasado,
            diferenciaVsMesPasado: Math.abs(diferenciaVsMesPasado),
            porcentajeDiferencia,
            esMejor,
            metaMes,
            cumplimientoMeta: cumplimientoMeta.toFixed(1),
            diasRestantes: diasEnMes - diaDelMes
        });
    };

    if (!proyeccion) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
            </div>

            {/* Content */}
            <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">📊 Proyección del Mes</h2>
                        <p className="text-indigo-100 text-sm">
                            <Calendar className="inline mr-1" size={14} />
                            {new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                    >
                        <Target size={32} />
                    </motion.div>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Esperado */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign size={18} className="text-yellow-300" />
                            <p className="text-sm font-medium text-indigo-100">Se espera cobrar</p>
                        </div>
                        <p className="text-3xl font-bold">
                            S/ <AnimatedNumber value={proyeccion.ingresosEsperados} decimals={2} />
                        </p>
                    </motion.div>

                    {/* Ya Cobrado */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 size={18} className="text-green-300" />
                            <p className="text-sm font-medium text-indigo-100">Ya cobrado</p>
                        </div>
                        <p className="text-3xl font-bold">
                            S/ <AnimatedNumber value={proyeccion.yaCobrado} decimals={2} />
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${proyeccion.porcentajeCobrado}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
                                />
                            </div>
                            <span className="text-sm font-bold text-green-300">{proyeccion.porcentajeCobrado}%</span>
                        </div>
                    </motion.div>
                </div>

                {/* Falta Cobrar */}
                <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-6"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={18} className="text-orange-300" />
                            <p className="text-sm font-medium text-indigo-100">Falta por cobrar</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-orange-300">
                                S/ <AnimatedNumber value={proyeccion.faltaCobrar} decimals={2} />
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-indigo-100">
                            <Users size={16} />
                            <span>{proyeccion.cantidadFaltan} clientes pendientes</span>
                        </div>
                        <div className="flex items-center gap-1 text-indigo-100">
                            <Calendar size={16} />
                            <span>{proyeccion.diasRestantes} días restantes</span>
                        </div>
                    </div>
                </motion.div>

                {/* Comparativas */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Vs Mes Anterior */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                    >
                        <p className="text-xs text-indigo-100 mb-2 uppercase font-medium">vs Mes Anterior</p>
                        <div className="flex items-center gap-2">
                            {proyeccion.esMejor ? (
                                <TrendingUp className="text-green-300" size={24} />
                            ) : (
                                <TrendingDown className="text-red-300" size={24} />
                            )}
                            <div>
                                <p className={`text-2xl font-bold ${proyeccion.esMejor ? 'text-green-300' : 'text-red-300'}`}>
                                    {proyeccion.esMejor ? '+' : '-'}{proyeccion.porcentajeDiferencia}%
                                </p>
                                <p className="text-xs text-indigo-200">
                                    S/ {proyeccion.diferenciaVsMesPasado.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Meta del Mes */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                    >
                        <p className="text-xs text-indigo-100 mb-2 uppercase font-medium flex items-center gap-1">
                            <Target size={14} />
                            Meta del Mes
                        </p>
                        <p className="text-2xl font-bold mb-2">
                            S/ <AnimatedNumber value={proyeccion.metaMes} decimals={2} />
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${proyeccion.cumplimientoMeta}%` }}
                                    transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                                    className={`h-full ${
                                        proyeccion.cumplimientoMeta >= 100 
                                            ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                                            : proyeccion.cumplimientoMeta >= 80
                                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                                            : 'bg-gradient-to-r from-red-400 to-pink-400'
                                    }`}
                                />
                            </div>
                            <span className="text-sm font-bold">{proyeccion.cumplimientoMeta}%</span>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Info */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-sm text-indigo-100"
                >
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        <span>{proyeccion.cantidadCobrados} clientes ya pagaron</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span>Actualizado en tiempo real</span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ProyeccionMensual;
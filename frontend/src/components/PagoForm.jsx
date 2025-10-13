import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, DollarSign, Calendar, CreditCard, FileText, 
    Phone, Hash, CheckCircle, AlertCircle, ChevronRight,
    Loader, Search, User, MapPin, CreditCard as CardIcon
} from 'lucide-react';
import pagoService from '../services/pagoService';

const PagoForm = ({ clientes, clientePreseleccionado, onClose, onPagoGuardado }) => {
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [mesesSeleccionados, setMesesSeleccionados] = useState([]);
    const [mesesDisponibles, setMesesDisponibles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [clientesFiltrados, setClientesFiltrados] = useState([]);
    const searchRef = useRef(null);
    
    const [formData, setFormData] = useState({
        cliente_id: clientePreseleccionado || '',
        monto: '',
        fecha_pago: new Date().toISOString().split('T')[0],
        metodo_pago: 'Efectivo',
        numero_recibo: '',
        telefono_contacto: '',
        numero_operacion: '',
        observaciones: '',
        meses_pagados: 1
    });

    useEffect(() => {
        if (clientePreseleccionado) {
            const cliente = clientes.find(c => c.id === parseInt(clientePreseleccionado));
            if (cliente) {
                seleccionarCliente(cliente);
            }
        }
    }, [clientePreseleccionado, clientes]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setMostrarSugerencias(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (clienteSeleccionado) {
            generarMesesDisponibles();
        }
    }, [clienteSeleccionado]);

    const buscarClientes = (texto) => {
        setBusquedaCliente(texto);
        setMostrarSugerencias(true);

        if (!texto.trim()) {
            setClientesFiltrados([]);
            return;
        }

        const terminoBusqueda = texto.toLowerCase().trim();
        
        const resultados = clientes.filter(cliente => {
            const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
            if (nombreCompleto.includes(terminoBusqueda)) return true;
            if (cliente.dni && cliente.dni.includes(terminoBusqueda)) return true;
            if (cliente.direccion && cliente.direccion.toLowerCase().includes(terminoBusqueda)) return true;
            if (cliente.telefono && cliente.telefono.includes(terminoBusqueda)) return true;
            if (cliente.tipo_servicio && cliente.tipo_servicio.toLowerCase().includes(terminoBusqueda)) return true;
            if (cliente.id && cliente.id.toString().includes(terminoBusqueda)) return true;
            return false;
        });

        resultados.sort((a, b) => {
            const deudaA = a.meses_deuda || 0;
            const deudaB = b.meses_deuda || 0;
            return deudaB - deudaA;
        });

        setClientesFiltrados(resultados.slice(0, 15)); // Mostrar 15 resultados
    };

    const seleccionarCliente = (cliente) => {
        setClienteSeleccionado(cliente);
        setBusquedaCliente(`${cliente.nombre} ${cliente.apellido}`);
        setMostrarSugerencias(false);
        setMesesSeleccionados([]);
        setError('');
        
        setFormData(prev => ({
            ...prev,
            cliente_id: cliente.id,
            telefono_contacto: cliente.telefono || '',
            meses_pagados: 0,
            monto: '0.00'
        }));
    };

    const limpiarBusqueda = () => {
        setBusquedaCliente('');
        setClienteSeleccionado(null);
        setClientesFiltrados([]);
        setMostrarSugerencias(false);
        setMesesSeleccionados([]);
        setFormData(prev => ({
            ...prev,
            cliente_id: '',
            meses_pagados: 0,
            monto: '0.00'
        }));
    };

    const generarMesesDisponibles = () => {
        const mesesNombres = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const añoActual = hoy.getFullYear();
        const mesesDeuda = clienteSeleccionado.meses_deuda || 0;

        const meses = [];
        let mesInicio = mesActual - mesesDeuda;
        let añoInicio = añoActual;
        
        while (mesInicio < 0) {
            mesInicio += 12;
            añoInicio--;
        }

        const totalMeses = Math.max(mesesDeuda > 0 ? mesesDeuda + 12 : 12, 36);
        
        for (let i = 0; i < totalMeses; i++) {
            let mes = mesInicio + i;
            let año = añoInicio;
            
            while (mes > 11) {
                mes -= 12;
                año++;
            }

            const esAtrasado = (año < añoActual) || (año === añoActual && mes < mesActual);
            const esActual = año === añoActual && mes === mesActual;
            const esAdelantado = (año > añoActual) || (año === añoActual && mes > mesActual);

            meses.push({
                mes: mes,
                año: año,
                nombre: mesesNombres[mes],
                nombreCompleto: `${mesesNombres[mes]} ${año}`,
                tipo: esAtrasado ? 'atrasado' : (esActual ? 'actual' : 'adelantado'),
                indice: i
            });
        }

        setMesesDisponibles(meses);
        
        if (meses.length > 0) {
            setMesesSeleccionados([meses[0]]);
            calcularMonto([meses[0]]);
        }
    };

    const toggleMes = (mes) => {
        let nuevosSeleccionados = [...mesesSeleccionados];
        
        const index = nuevosSeleccionados.findIndex(m => 
            m.mes === mes.mes && m.año === mes.año
        );

        if (index > -1) {
            nuevosSeleccionados.splice(index, 1);
        } else {
            nuevosSeleccionados.push(mes);
        }

        nuevosSeleccionados.sort((a, b) => {
            if (a.año !== b.año) return a.año - b.año;
            return a.mes - b.mes;
        });

        setMesesSeleccionados(nuevosSeleccionados);
        calcularMonto(nuevosSeleccionados);
    };

    const seleccionarRango = (hastaMes) => {
        const primerMes = mesesDisponibles[0];
        const indexFinal = mesesDisponibles.findIndex(m => 
            m.mes === hastaMes.mes && m.año === hastaMes.año
        );
        
        const rango = mesesDisponibles.slice(0, indexFinal + 1);
        setMesesSeleccionados(rango);
        calcularMonto(rango);
    };

    const calcularMonto = (mesesArray) => {
        if (!clienteSeleccionado) return;
        
        const cantidadMeses = mesesArray.length;
        const montoTotal = clienteSeleccionado.precio_mensual * cantidadMeses;
        
        setFormData(prev => ({
            ...prev,
            meses_pagados: cantidadMeses,
            monto: montoTotal.toFixed(2)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.cliente_id) {
            setError('Por favor seleccione un cliente');
            return;
        }

        if (mesesSeleccionados.length === 0) {
            setError('Por favor seleccione al menos un mes a pagar');
            return;
        }

        if (!formData.numero_recibo || formData.numero_recibo.trim() === '') {
            setError('El número de recibo es obligatorio');
            return;
        }

        const monto = parseFloat(formData.monto);
        if (isNaN(monto) || monto <= 0) {
            setError('El monto debe ser mayor a 0');
            return;
        }

        if (monto > 999999.99) {
            setError('El monto excede el límite permitido (S/ 999,999.99)');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const pagoData = {
                ...formData,
                meses_pagados: mesesSeleccionados.length,
                monto: monto
            };

            const resultado = await pagoService.registrar(pagoData);
            onPagoGuardado(resultado, clienteSeleccionado);
        } catch (error) {
            console.error('❌ Error registrando pago:', error);
            
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else if (error.message) {
                setError(error.message);
            } else {
                setError('Error al registrar el pago. Por favor intente nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getMesColor = (mes) => {
        const isSelected = mesesSeleccionados.some(m => 
            m.mes === mes.mes && m.año === mes.año
        );

        if (isSelected) {
            if (mes.tipo === 'atrasado') return 'bg-red-500 text-white border-red-600';
            if (mes.tipo === 'actual') return 'bg-blue-500 text-white border-blue-600';
            if (mes.tipo === 'adelantado') return 'bg-green-500 text-white border-green-600';
        }

        if (mes.tipo === 'atrasado') return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
        if (mes.tipo === 'actual') return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
        if (mes.tipo === 'adelantado') return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
    };

    const resaltarTexto = (texto, busqueda) => {
        if (!busqueda.trim()) return texto;
        
        const regex = new RegExp(`(${busqueda})`, 'gi');
        const partes = texto.split(regex);
        
        return partes.map((parte, i) => 
            regex.test(parte) ? 
                <span key={i} className="bg-yellow-200 font-bold">{parte}</span> : 
                parte
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-3xl sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <DollarSign size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Registrar Pago</h2>
                                <p className="text-sm text-white/90">Complete los datos del pago</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-all"
                            disabled={loading}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
                    {/* MENSAJE DE ERROR */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-xl flex items-start gap-3"
                            >
                                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                <div className="flex-1">
                                    <p className="font-bold text-red-900">Error al registrar pago</p>
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                                <button type="button" onClick={() => setError('')} className="text-red-600 hover:text-red-800">
                                    <X size={18} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Cliente Info Card */}
                    {clienteSeleccionado && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 mb-4 border-2 border-blue-200"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                        {clienteSeleccionado.nombre.charAt(0)}{clienteSeleccionado.apellido.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                                        </h3>
                                        <p className="text-sm text-gray-600">DNI: {clienteSeleccionado.dni} • ID: #{clienteSeleccionado.id}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={limpiarBusqueda}
                                    className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold"
                                >
                                    Cambiar
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Estado:</p>
                                    <p className="font-bold text-base">{clienteSeleccionado.estado_pago?.toUpperCase()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Deuda Total:</p>
                                    <p className="font-bold text-base text-red-600">
                                        S/ {((clienteSeleccionado.meses_deuda || 0) * clienteSeleccionado.precio_mensual).toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Meses Adeudados:</p>
                                    <p className="font-bold text-base">
                                        {clienteSeleccionado.meses_deuda || 0} {clienteSeleccionado.meses_deuda === 1 ? 'mes' : 'meses'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* BUSCADOR DE CLIENTES */}
                    {!clientePreseleccionado && !clienteSeleccionado && (
                        <div className="mb-4" ref={searchRef}>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Search size={18} className="text-blue-600" />
                                Buscar Cliente *
                            </label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={busquedaCliente}
                                    onChange={(e) => buscarClientes(e.target.value)}
                                    onFocus={() => setMostrarSugerencias(true)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                    placeholder="Busca por nombre, DNI, dirección..."
                                    disabled={loading}
                                />

                                {/* SUGERENCIAS */}
                                <AnimatePresence>
                                    {mostrarSugerencias && clientesFiltrados.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-2xl max-h-[65vh] overflow-y-auto"
                                        >
                                            {clientesFiltrados.map((cliente) => (
                                                <motion.button
                                                    key={cliente.id}
                                                    type="button"
                                                    onClick={() => seleccionarCliente(cliente)}
                                                    whileHover={{ backgroundColor: '#eff6ff' }}
                                                    className="w-full px-4 py-3 text-left border-b border-gray-200 last:border-b-0 hover:bg-blue-50 transition-all"
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                                {cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-gray-900 text-base">
                                                                    {resaltarTexto(`${cliente.nombre} ${cliente.apellido}`, busquedaCliente)}
                                                                </p>
                                                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-0.5">
                                                                    <span className="flex items-center gap-1">
                                                                        <CardIcon size={14} className="flex-shrink-0" />
                                                                        DNI: {resaltarTexto(cliente.dni, busquedaCliente)}
                                                                    </span>
                                                                    {cliente.telefono && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Phone size={14} className="flex-shrink-0" />
                                                                            {resaltarTexto(cliente.telefono, busquedaCliente)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {cliente.direccion && (
                                                                    <p className="text-sm text-gray-500 truncate mt-0.5 flex items-center gap-1">
                                                                        <MapPin size={14} className="flex-shrink-0" />
                                                                        {resaltarTexto(cliente.direccion, busquedaCliente)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            {(cliente.meses_deuda || 0) > 0 ? (
                                                                <span className="inline-flex px-3 py-1 bg-red-100 text-red-800 rounded-lg font-bold text-sm whitespace-nowrap">
                                                                    DEBE {cliente.meses_deuda}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex px-3 py-1 bg-green-100 text-green-800 rounded-lg font-bold text-sm whitespace-nowrap">
                                                                    AL DÍA
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {mostrarSugerencias && busquedaCliente && clientesFiltrados.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-lg p-4 text-center text-gray-600"
                                    >
                                        <Search className="mx-auto mb-2 text-gray-400" size={32} />
                                        <p className="text-sm">No se encontraron clientes con "{busquedaCliente}"</p>
                                    </motion.div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">
                                💡 Busca por nombre, DNI, dirección, teléfono o ID
                            </p>
                        </div>
                    )}

                    {/* Selector de Meses */}
                    {clienteSeleccionado && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Calendar size={18} />
                                    Meses a Pagar *
                                </label>
                                <div className="flex gap-2 text-xs">
                                    <span className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-red-200 border border-red-400 rounded"></div>
                                        Atrasado
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-blue-200 border border-blue-400 rounded"></div>
                                        Actual
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-green-200 border border-green-400 rounded"></div>
                                        Adelanto
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-6 gap-2 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 max-h-64 overflow-y-auto">
                                {mesesDisponibles.map((mes, index) => (
                                    <motion.button
                                        key={index}
                                        type="button"
                                        onClick={() => toggleMes(mes)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={loading}
                                        className={`p-2.5 rounded-lg border-2 font-semibold text-xs transition-all ${getMesColor(mes)} ${loading ? 'opacity-50' : ''}`}
                                    >
                                        <div className="font-bold">{mes.nombre}</div>
                                        <div className="opacity-75 text-[10px]">{mes.año}</div>
                                    </motion.button>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => seleccionarRango(mesesDisponibles[0])}
                                    disabled={loading}
                                    className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-semibold"
                                >
                                    Solo este mes
                                </button>
                                {clienteSeleccionado.meses_deuda > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const hasta = mesesDisponibles[clienteSeleccionado.meses_deuda - 1];
                                            seleccionarRango(hasta);
                                        }}
                                        disabled={loading}
                                        className="px-3 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg font-semibold"
                                    >
                                        TODO ({clienteSeleccionado.meses_deuda} meses)
                                    </button>
                                )}
                            </div>

                            {mesesSeleccionados.length > 0 && (
                                <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
                                        <div className="flex-1">
                                            <p className="font-bold text-blue-900 text-sm">
                                                Pagando {mesesSeleccionados.length} {mesesSeleccionados.length === 1 ? 'mes' : 'meses'}
                                            </p>
                                            <p className="text-xs text-blue-800">
                                                {mesesSeleccionados.map(m => m.nombreCompleto).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Formulario */}
                    {clienteSeleccionado && (
                        <>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Monto Total (S/) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.monto}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg"
                                        required
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Método de Pago *</label>
                                    <select
                                        value={formData.metodo_pago}
                                        onChange={(e) => setFormData({...formData, metodo_pago: e.target.value})}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Transferencia">Transferencia</option>
                                        <option value="Yape">Yape</option>
                                        <option value="Plin">Plin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Número de Recibo *</label>
                                    <input
                                        type="text"
                                        value={formData.numero_recibo}
                                        onChange={(e) => setFormData({...formData, numero_recibo: e.target.value})}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        placeholder="REC-20251011-001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={formData.telefono_contacto}
                                        onChange={(e) => setFormData({...formData, telefono_contacto: e.target.value})}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="+51 987 654 321"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Observaciones</label>
                                <textarea
                                    value={formData.observaciones}
                                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Notas adicionales..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                                    disabled={mesesSeleccionados.length === 0 || loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="animate-spin" size={20} />
                                            Registrando...
                                        </>
                                    ) : (
                                        'Registrar Pago'
                                    )}
                                </motion.button>
                                <motion.button
                                    type="button"
                                    onClick={onClose}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-6 py-3.5 bg-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-400"
                                    disabled={loading}
                                >
                                    Cancelar
                                </motion.button>
                            </div>
                        </>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

export default PagoForm;











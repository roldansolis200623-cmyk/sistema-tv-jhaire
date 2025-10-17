import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, DollarSign, Calendar, CheckCircle, AlertCircle,
    Loader, Search, MapPin, CreditCard as CardIcon, Phone
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
            if (cliente) seleccionarCliente(cliente);
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
        if (clienteSeleccionado) generarMesesDisponibles();
    }, [clienteSeleccionado]);

    const buscarClientes = (texto) => {
        setBusquedaCliente(texto);
        setMostrarSugerencias(true);
        if (!texto.trim()) {
            setClientesFiltrados([]);
            return;
        }
        const term = texto.toLowerCase().trim();
        const resultados = clientes.filter(c => {
            const nombre = `${c.nombre} ${c.apellido}`.toLowerCase();
            return nombre.includes(term) || c.dni?.includes(term) || c.direccion?.toLowerCase().includes(term) || 
                   c.telefono?.includes(term) || c.id?.toString().includes(term);
        }).sort((a, b) => (b.meses_deuda || 0) - (a.meses_deuda || 0)).slice(0, 20); // AUMENTADO A 20 RESULTADOS
        setClientesFiltrados(resultados);
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
        setFormData(prev => ({ ...prev, cliente_id: '', meses_pagados: 0, monto: '0.00' }));
    };

    const generarMesesDisponibles = () => {
        const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const añoActual = hoy.getFullYear();
        const mesesDeuda = clienteSeleccionado.meses_deuda || 0;
        const meses = [];
        let mesInicio = mesActual - mesesDeuda;
        let añoInicio = añoActual;
        while (mesInicio < 0) { mesInicio += 12; añoInicio--; }
        const totalMeses = Math.max(mesesDeuda > 0 ? mesesDeuda + 12 : 12, 36);
        for (let i = 0; i < totalMeses; i++) {
            let mes = mesInicio + i;
            let año = añoInicio;
            while (mes > 11) { mes -= 12; año++; }
            const esAtrasado = (año < añoActual) || (año === añoActual && mes < mesActual);
            const esActual = año === añoActual && mes === mesActual;
            meses.push({
                mes, año,
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
        let nuevos = [...mesesSeleccionados];
        const index = nuevos.findIndex(m => m.mes === mes.mes && m.año === mes.año);
        if (index > -1) nuevos.splice(index, 1);
        else nuevos.push(mes);
        nuevos.sort((a, b) => a.año !== b.año ? a.año - b.año : a.mes - b.mes);
        setMesesSeleccionados(nuevos);
        calcularMonto(nuevos);
    };

    const seleccionarRango = (hastaMes) => {
        const idx = mesesDisponibles.findIndex(m => m.mes === hastaMes.mes && m.año === hastaMes.año);
        const rango = mesesDisponibles.slice(0, idx + 1);
        setMesesSeleccionados(rango);
        calcularMonto(rango);
    };

    const calcularMonto = (mesesArray) => {
        if (!clienteSeleccionado) return;
        const total = clienteSeleccionado.precio_mensual * mesesArray.length;
        setFormData(prev => ({ ...prev, meses_pagados: mesesArray.length, monto: total.toFixed(2) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.cliente_id) { setError('Seleccione un cliente'); return; }
        if (mesesSeleccionados.length === 0) { setError('Seleccione al menos un mes'); return; }
        if (!formData.numero_recibo?.trim()) { setError('Número de recibo obligatorio'); return; }
        const monto = parseFloat(formData.monto);
        if (isNaN(monto) || monto <= 0) { setError('Monto debe ser mayor a 0'); return; }
        if (monto > 999999.99) { setError('Monto excede el límite'); return; }
        setLoading(true);
        setError('');
        try {
            const resultado = await pagoService.registrar({ ...formData, meses_pagados: mesesSeleccionados.length, monto });
            onPagoGuardado(resultado, clienteSeleccionado);
        } catch (error) {
            setError(error.response?.data?.error || error.message || 'Error al registrar');
        } finally {
            setLoading(false);
        }
    };

    const getMesColor = (mes) => {
        const sel = mesesSeleccionados.some(m => m.mes === mes.mes && m.año === mes.año);
        if (sel) {
            if (mes.tipo === 'atrasado') return 'bg-red-500 text-white border-red-600';
            if (mes.tipo === 'actual') return 'bg-blue-500 text-white border-blue-600';
            return 'bg-green-500 text-white border-green-600';
        }
        if (mes.tipo === 'atrasado') return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
        if (mes.tipo === 'actual') return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
        return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
    };

    const resaltarTexto = (texto, busqueda) => {
        if (!busqueda.trim()) return texto;
        const regex = new RegExp(`(${busqueda})`, 'gi');
        return texto.split(regex).map((p, i) => 
            regex.test(p) ? <span key={i} className="bg-yellow-200 font-bold">{p}</span> : p
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col"
            >
                {/* HEADER MÁS COMPACTO */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-5 text-white rounded-t-2xl sm:rounded-t-3xl flex-shrink-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl p-2" />
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl sm:text-2xl font-bold truncate">Registrar Pago</h2>
                                <p className="text-xs sm:text-sm hidden sm:block">Complete los datos</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl" disabled={loading}>
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-3 sm:p-5 flex-1 overflow-y-auto">
                    {/* ERROR */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-3 p-3 bg-red-100 border-2 border-red-300 rounded-xl flex gap-2"
                            >
                                <AlertCircle className="text-red-600 w-5 h-5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-bold text-red-900 text-sm">Error</p>
                                    <p className="text-xs text-red-800">{error}</p>
                                </div>
                                <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* CLIENTE CARD */}
                    {clienteSeleccionado && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-3 border-2 border-blue-200">
                            <div className="flex justify-between gap-2 mb-3">
                                <div className="flex gap-2 flex-1 min-w-0">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                                        {clienteSeleccionado.nombre[0]}{clienteSeleccionado.apellido[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base sm:text-lg truncate">{clienteSeleccionado.nombre} {clienteSeleccionado.apellido}</h3>
                                        <p className="text-xs sm:text-sm text-gray-600">DNI: {clienteSeleccionado.dni} • ID: #{clienteSeleccionado.id}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={limpiarBusqueda} className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-100 text-red-700 rounded-lg font-semibold whitespace-nowrap">Cambiar</button>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                                <div><p className="text-gray-600 text-xs">Estado:</p><p className="font-bold">{clienteSeleccionado.estado_pago?.toUpperCase()}</p></div>
                                <div><p className="text-gray-600 text-xs">Deuda:</p><p className="font-bold text-red-600">S/ {((clienteSeleccionado.meses_deuda || 0) * clienteSeleccionado.precio_mensual).toFixed(2)}</p></div>
                                <div><p className="text-gray-600 text-xs">Meses:</p><p className="font-bold">{clienteSeleccionado.meses_deuda || 0}</p></div>
                            </div>
                        </div>
                    )}

                    {/* BUSCADOR MEJORADO - MÁS RESULTADOS VISIBLES */}
                    {!clientePreseleccionado && !clienteSeleccionado && (
                        <div className="mb-3" ref={searchRef}>
                            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Search className="w-4 h-4 sm:w-5 sm:h-5" /> Buscar Cliente *
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                <input
                                    type="text"
                                    value={busquedaCliente}
                                    onChange={(e) => buscarClientes(e.target.value)}
                                    onFocus={() => setMostrarSugerencias(true)}
                                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                    placeholder="Nombre, DNI, dirección..."
                                />
                                {/* SUGERENCIAS MÁS GRANDES - SIN LÍMITE DE ALTURA */}
                                <AnimatePresence>
                                    {mostrarSugerencias && clientesFiltrados.length > 0 && (
                                        <div className="absolute z-20 w-full mt-2 bg-white border-2 rounded-xl shadow-2xl max-h-[60vh] overflow-y-auto">
                                            {clientesFiltrados.map(c => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => seleccionarCliente(c)}
                                                    className="w-full px-3 sm:px-4 py-3 text-left border-b hover:bg-blue-50 transition-colors"
                                                >
                                                    <div className="flex justify-between gap-2">
                                                        <div className="flex gap-2 sm:gap-3 flex-1 min-w-0">
                                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                                                                {c.nombre[0]}{c.apellido[0]}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-sm sm:text-base truncate">{resaltarTexto(`${c.nombre} ${c.apellido}`, busquedaCliente)}</p>
                                                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                                                    <span className="flex items-center gap-1">
                                                                        <CardIcon className="w-3 h-3" />
                                                                        {c.dni}
                                                                    </span>
                                                                    {c.telefono && (
                                                                        <span className="hidden sm:flex items-center gap-1">
                                                                            <Phone className="w-3 h-3" />
                                                                            {c.telefono}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {c.direccion && (
                                                                    <p className="text-xs text-gray-500 truncate mt-0.5 hidden sm:flex items-center gap-1">
                                                                        <MapPin className="w-3 h-3" />
                                                                        {c.direccion}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className={`text-xs px-2 py-1 rounded-lg font-bold whitespace-nowrap self-start ${(c.meses_deuda || 0) > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                            {(c.meses_deuda || 0) > 0 ? `DEBE ${c.meses_deuda}` : 'AL DÍA'}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">💡 Busca por nombre, DNI, dirección o teléfono</p>
                        </div>
                    )}

                    {/* SELECTOR DE MESES */}
                    {clienteSeleccionado && (
                        <>
                            <div className="mb-3">
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs sm:text-sm font-bold flex items-center gap-1">
                                        <Calendar className="w-4 h-4" /> Meses *
                                    </label>
                                    <div className="flex gap-1.5 text-[10px] sm:text-xs">
                                        <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-red-200 border border-red-400 rounded"></div><span className="hidden sm:inline">Atrasado</span></span>
                                        <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-blue-200 border border-blue-400 rounded"></div><span className="hidden sm:inline">Actual</span></span>
                                        <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-green-200 border border-green-400 rounded"></div><span className="hidden sm:inline">Adelanto</span></span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1.5 sm:gap-2 p-3 bg-gray-50 rounded-xl border-2 max-h-44 overflow-y-auto">
                                    {mesesDisponibles.map((mes, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => toggleMes(mes)}
                                            className={`p-2 rounded-lg border-2 font-semibold text-[10px] sm:text-xs ${getMesColor(mes)}`}
                                        >
                                            <div className="font-bold">{mes.nombre}</div>
                                            <div className="text-[9px] sm:text-[10px] opacity-75">{mes.año}</div>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-1.5 mt-2">
                                    <button type="button" onClick={() => seleccionarRango(mesesDisponibles[0])} className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs bg-blue-100 text-blue-800 rounded-lg font-semibold">Este mes</button>
                                    {clienteSeleccionado.meses_deuda > 0 && (
                                        <button type="button" onClick={() => seleccionarRango(mesesDisponibles[clienteSeleccionado.meses_deuda - 1])} className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs bg-orange-100 text-orange-800 rounded-lg font-semibold">TODO ({clienteSeleccionado.meses_deuda})</button>
                                    )}
                                </div>
                                {mesesSeleccionados.length > 0 && (
                                    <div className="mt-2 p-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                        <div className="flex gap-2">
                                            <CheckCircle className="text-blue-600 w-4 h-4" />
                                            <div className="flex-1">
                                                <p className="font-bold text-blue-900 text-xs sm:text-sm">Pagando {mesesSeleccionados.length} mes(es)</p>
                                                <p className="text-[10px] sm:text-xs text-blue-800 line-clamp-2">{mesesSeleccionados.map(m => m.nombreCompleto).join(', ')}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* FORMULARIO COMPACTO */}
                            <div className="grid sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
                                <div>
                                    <label className="block text-xs font-bold mb-1.5">Monto (S/) *</label>
                                    <input type="number" step="0.01" value={formData.monto} className="w-full px-3 py-2.5 border-2 rounded-xl font-bold text-base" readOnly />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1.5">Método *</label>
                                    <select value={formData.metodo_pago} onChange={(e) => setFormData({...formData, metodo_pago: e.target.value})} className="w-full px-3 py-2.5 border-2 rounded-xl text-sm">
                                        <option>Efectivo</option>
                                        <option>Transferencia</option>
                                        <option>Yape</option>
                                        <option>Plin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
                                <div>
                                    <label className="block text-xs font-bold mb-1.5">Recibo *</label>
                                    <input type="text" value={formData.numero_recibo} onChange={(e) => setFormData({...formData, numero_recibo: e.target.value})} className="w-full px-3 py-2.5 border-2 rounded-xl text-sm" placeholder="REC-001" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1.5">Teléfono</label>
                                    <input type="tel" value={formData.telefono_contacto} onChange={(e) => setFormData({...formData, telefono_contacto: e.target.value})} className="w-full px-3 py-2.5 border-2 rounded-xl text-sm" placeholder="+51 987 654 321" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="block text-xs font-bold mb-1.5">Observaciones</label>
                                <textarea value={formData.observaciones} onChange={(e) => setFormData({...formData, observaciones: e.target.value})} className="w-full px-3 py-2.5 border-2 rounded-xl text-sm" rows="2" placeholder="Notas..." />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50"
                                    disabled={loading || mesesSeleccionados.length === 0}
                                >
                                    {loading ? <><Loader className="animate-spin w-4 h-4" /> Registrando...</> : 'Registrar Pago'}
                                </button>
                                <button type="button" onClick={onClose} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-300 text-gray-700 rounded-xl font-bold text-sm sm:text-base" disabled={loading}>Cancelar</button>
                            </div>
                        </>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

export default PagoForm;
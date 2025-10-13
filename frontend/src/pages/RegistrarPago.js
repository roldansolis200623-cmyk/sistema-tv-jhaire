import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Calendar, CreditCard, FileText, Phone, Hash, AlertCircle } from 'lucide-react';
import { clienteService, pagoService } from '../services/api';

const RegistrarPago = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const clienteIdProp = location.state?.clienteId;

    const [clientes, setClientes] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        cliente_id: clienteIdProp || '',
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
        loadClientes();
    }, []);

    useEffect(() => {
        if (clienteIdProp && clientes.length > 0) {
            const cliente = clientes.find(c => c.id === parseInt(clienteIdProp));
            if (cliente) {
                handleClienteChange(cliente.id);
            }
        }
    }, [clienteIdProp, clientes]);

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

    const handleClienteChange = (clienteId) => {
    const cliente = clientes.find(c => c.id === parseInt(clienteId));
    setClienteSeleccionado(cliente);
    
    if (cliente) {
        const mesesDeuda = cliente.meses_deuda || 0;
        
        // Si debe, por defecto paga 1 mes. Si está al día, paga el mes actual
        const mesesAPagar = mesesDeuda > 0 ? 1 : 1;
        
        setFormData(prev => ({
            ...prev,
            cliente_id: clienteId,
            telefono_contacto: cliente.telefono || '',
            meses_pagados: mesesAPagar,
            monto: (cliente.precio_mensual * mesesAPagar).toFixed(2)
        }));
    }
};

    const handleMesesPagadosChange = (meses) => {
        const mesesNum = parseInt(meses) || 1;
        const mesesDeuda = clienteSeleccionado?.meses_deuda || 0;
        const mesesValidos = Math.min(Math.max(1, mesesNum), mesesDeuda || 999);
        
        setFormData(prev => ({
            ...prev,
            meses_pagados: mesesValidos,
            monto: (clienteSeleccionado.precio_mensual * mesesValidos).toFixed(2)
        }));
    };

    const calcularMonto = () => {
        if (!clienteSeleccionado) return;
        
        const mesesDeuda = clienteSeleccionado.meses_deuda || 0;
        const deudaTotal = clienteSeleccionado.precio_mensual * mesesDeuda;
        
        setFormData(prev => ({
            ...prev,
            meses_pagados: mesesDeuda,
            monto: deudaTotal.toFixed(2)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.cliente_id) {
            alert('Por favor seleccione un cliente');
            return;
        }

        try {
            await pagoService.registrar(formData);
            navigate('/pagos');
        } catch (error) {
            console.error('Error registrando pago:', error);
            alert('Error al registrar el pago');
        }
    };

    const opcionesMesesPago = () => {
    if (!clienteSeleccionado) return [];
    
    const mesesDeuda = clienteSeleccionado.meses_deuda || 0;
    const opciones = [];
    
    if (mesesDeuda <= 0) {
        // Si no tiene deuda o está adelantado, puede pagar de 1 a 6 meses adelantados
        for (let i = 1; i <= 6; i++) {
            const monto = clienteSeleccionado.precio_mensual * i;
            opciones.push({
                label: i === 1 
                    ? `Mes Actual - S/ ${monto.toFixed(2)}` 
                    : `${i} meses (ADELANTADO) - S/ ${monto.toFixed(2)}`,
                value: i,
                monto: monto
            });
        }
    } else {
        // Si tiene deuda, puede pagar desde 1 hasta todos los meses + 3 adelantados
        const maxMeses = mesesDeuda + 3;
        for (let i = 1; i <= maxMeses; i++) {
            const monto = clienteSeleccionado.precio_mensual * i;
            let label;
            
            if (i < mesesDeuda) {
                label = `${i} ${i === 1 ? 'mes' : 'meses'} - S/ ${monto.toFixed(2)}`;
            } else if (i === mesesDeuda) {
                label = `Pagar TODO (${i} meses) - S/ ${monto.toFixed(2)}`;
            } else {
                const adelanto = i - mesesDeuda;
                label = `TODO + ${adelanto} adelantado(s) - S/ ${monto.toFixed(2)}`;
            }
            
            opciones.push({
                label: label,
                value: i,
                monto: monto
            });
        }
    }
    
    return opciones;
};

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
                <div className="text-white text-xl">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-8"
                >
                    <motion.button
                        onClick={() => navigate('/pagos')}
                        whileHover={{ scale: 1.05, x: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                    >
                        <ArrowLeft size={20} />
                        Volver
                    </motion.button>
                    <h1 className="text-3xl font-bold text-white">Registrar Pago</h1>
                </motion.div>

                {/* Información del Cliente Seleccionado */}
                {clienteSeleccionado && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 mb-6 text-white shadow-2xl"
                    >
                        <h2 className="text-2xl font-bold mb-4">{clienteSeleccionado.nombre} {clienteSeleccionado.apellido}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="opacity-80">Estado:</p>
                                <p className="font-bold text-lg">{clienteSeleccionado.estado.toUpperCase()}</p>
                            </div>
                            <div>
                                <p className="opacity-80">Deuda Total:</p>
                                <p className="font-bold text-lg">S/ {((clienteSeleccionado.meses_deuda || 0) * clienteSeleccionado.precio_mensual).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="opacity-80">Servicio:</p>
                                <p className="font-bold text-lg">{clienteSeleccionado.tipo_servicio || 'N/A'} (S/ {clienteSeleccionado.precio_mensual}/mes)</p>
                            </div>
                            <div>
                                <p className="opacity-80">Meses Adeudados:</p>
                                <p className="font-bold text-lg">{clienteSeleccionado.meses_deuda || 0} {clienteSeleccionado.meses_deuda === 1 ? 'mes' : 'meses'}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Formulario */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow-2xl p-8"
                >
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Datos del Pago</h3>

                    {/* Selector de Cliente */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Cliente *
                        </label>
                        <select
                            value={formData.cliente_id}
                            onChange={(e) => handleClienteChange(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="">Seleccione un cliente</option>
                            {clientes.map(cliente => (
                                <option key={cliente.id} value={cliente.id}>
                                    {cliente.nombre} {cliente.apellido} - DNI: {cliente.dni} 
                                    {(cliente.meses_deuda || 0) > 0 && ` (DEBE ${cliente.meses_deuda} ${cliente.meses_deuda === 1 ? 'MES' : 'MESES'})`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Meses a Pagar */}
                    {clienteSeleccionado && (
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar size={18} />
                                Mes(es) a Pagar *
                            </label>
                            <select
                                value={formData.meses_pagados}
                                onChange={(e) => handleMesesPagadosChange(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
                                required
                            >
                                {opcionesMesesPago().map(opcion => (
                                    <option key={opcion.value} value={opcion.value}>
                                        {opcion.label}
                                    </option>
                                ))}
                            </select>
                            {clienteSeleccionado.meses_deuda > 0 && (
                                <p className="text-sm text-orange-600 mt-2 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    Después del pago quedarán {Math.max(0, clienteSeleccionado.meses_deuda - formData.meses_pagados)} mes(es) de deuda
                                </p>
                            )}
                        </div>
                    )}

                    {/* Monto */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <DollarSign size={18} />
                            Monto a Pagar (S/) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.monto}
                            onChange={(e) => setFormData({...formData, monto: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-lg"
                            required
                        />
                        {clienteSeleccionado && (
                            <button
                                type="button"
                                onClick={calcularMonto}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold"
                            >
                                Calcular monto total de deuda
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Método de Pago */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <CreditCard size={18} />
                                Método de Pago *
                            </label>
                            <select
                                value={formData.metodo_pago}
                                onChange={(e) => setFormData({...formData, metodo_pago: e.target.value})}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Yape">Yape</option>
                                <option value="Plin">Plin</option>
                            </select>
                        </div>

                        {/* Número de Recibo */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <FileText size={18} />
                                Número de Recibo *
                            </label>
                            <input
                                type="text"
                                value={formData.numero_recibo}
                                onChange={(e) => setFormData({...formData, numero_recibo: e.target.value})}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                placeholder="REC-20251003-1358"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Teléfono Contacto */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Phone size={18} />
                                Teléfono Contacto
                            </label>
                            <input
                                type="tel"
                                value={formData.telefono_contacto}
                                onChange={(e) => setFormData({...formData, telefono_contacto: e.target.value})}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="+51957569737"
                            />
                        </div>

                        {/* Número de Operación */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Hash size={18} />
                                N° Operación
                            </label>
                            <input
                                type="text"
                                value={formData.numero_operacion}
                                onChange={(e) => setFormData({...formData, numero_operacion: e.target.value})}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Observaciones
                        </label>
                        <textarea
                            value={formData.observaciones}
                            onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-4">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                        >
                            Registrar Pago
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={() => navigate('/pagos')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-4 bg-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-400 transition-all"
                        >
                            Cancelar
                        </motion.button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
};

export default RegistrarPago;
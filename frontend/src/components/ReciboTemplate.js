import React from 'react';
import { Scissors, CheckCircle } from 'lucide-react';

const ReciboTemplate = ({ pago, cliente }) => {
    const obtenerFecha = () => {
        try {
            if (pago.fecha_pago) {
                const f = new Date(pago.fecha_pago);
                if (!isNaN(f.getTime())) return f;
            }
            if (pago.fecha) {
                const f = new Date(pago.fecha);
                if (!isNaN(f.getTime())) return f;
            }
            return new Date();
        } catch (e) {
            return new Date();
        }
    };
    
    const obtenerMonto = () => {
        try {
            const m = parseFloat(pago.monto);
            return isNaN(m) ? 0 : m;
        } catch (e) {
            return 0;
        }
    };
    
    const fecha = obtenerFecha();
    const monto = obtenerMonto();
    const mesesPagados = parseInt(pago.meses_pagados) || 1;
    const precioMensual = monto / mesesPagados;
    
    const generarRangoMeses = () => {
        const mesesNombres = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const mesActual = fecha.getMonth();
        const añoActual = fecha.getFullYear();
        
        if (mesesPagados === 1) {
            return `${mesesNombres[mesActual]} ${añoActual}`;
        } else {
            let mesFin = mesActual + mesesPagados - 1;
            let añoFin = añoActual;
            
            while (mesFin > 11) {
                mesFin -= 12;
                añoFin += 1;
            }
            
            return `${mesesNombres[mesActual]} - ${mesesNombres[mesFin]} ${añoFin}`;
        }
    };
    
    const rangoMeses = generarRangoMeses();
    
    const ReciboIndividual = ({ esCopia = false }) => (
        <div className="bg-white px-5 py-4" style={{ height: '140mm', pageBreakAfter: 'always' }}>
            {/* ENCABEZADO */}
            <div className="border-2 border-gray-900 p-3 mb-3">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h1 className="text-xl font-black text-gray-900" style={{ letterSpacing: '1px' }}>📺 TV JHAIRE</h1>
                        <p className="text-[9px] font-semibold text-gray-700">SERVICIO DE TELECOMUNICACIONES</p>
                    </div>
                    <div className="text-right">
                        <div className={`${esCopia ? 'bg-blue-600' : 'bg-gray-900'} text-white px-3 py-1 rounded text-[9px] font-bold mb-1`}>
                            {esCopia ? '📋 COPIA CLIENTE' : '🔵 ORIGINAL'}
                        </div>
                        <p className="text-[8px] font-bold text-gray-600">RUC: 20608257536</p>
                    </div>
                </div>
                
                <div className="border-t-2 border-b-2 border-gray-400 py-2 my-2">
                    <div className="grid grid-cols-2 gap-4 text-[8px]">
                        <div className="font-semibold">
                            <p>📍 Cal. San Martín N° 773</p>
                            <p>Tayabamba - Pataz</p>
                            <p>📞 951 151 453 / 997 115 410</p>
                        </div>
                        <div className="text-right font-bold">
                            <p className="text-[11px] text-gray-900 mb-1">RECIBO #{pago.numero_recibo || `${String(pago.id || '000').padStart(5, '0')}`}</p>
                            <p className="text-[9px]">📅 {fecha.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* DATOS DEL CLIENTE - MEJORADO */}
            <div className="border-2 border-gray-400 p-3 mb-3 bg-blue-50 rounded">
                <p className="text-[9px] font-black text-gray-900 mb-2 uppercase border-b-2 border-gray-400 pb-1">👤 Datos del Cliente</p>
                <div className="grid grid-cols-2 gap-3 text-[9px]">
                    <div>
                        <span className="text-gray-600 font-semibold">Nombre:</span>
                        <p className="font-bold text-gray-900">{cliente.nombre} {cliente.apellido}</p>
                    </div>
                    <div>
                        <span className="text-gray-600 font-semibold">DNI:</span>
                        <p className="font-bold text-gray-900">{cliente.dni || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                        <span className="text-gray-600 font-semibold">Dirección:</span>
                        <p className="font-bold text-gray-900">{cliente.direccion || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-600 font-semibold">Teléfono:</span>
                        <p className="font-bold">{cliente.telefono || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-600 font-semibold">Suministro:</span>
                        <p className="font-bold">{cliente.numero_suministro || cliente.suministro || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* DETALLE DEL SERVICIO - MEJORADO */}
            <div className="border-2 border-gray-400 mb-3 rounded overflow-hidden">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-3 py-2">
                    <p className="text-[9px] font-black uppercase">💰 Detalle del Servicio</p>
                </div>
                <table className="w-full text-[9px]">
                    <thead className="bg-gray-200 border-b-2 border-gray-400">
                        <tr>
                            <th className="text-left px-2 py-2 font-black">DESCRIPCIÓN</th>
                            <th className="text-center px-2 py-2 font-black">PERÍODO</th>
                            <th className="text-right px-2 py-2 font-black">P.UNIT</th>
                            <th className="text-right px-2 py-2 font-black">IMPORTE</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-300 hover:bg-blue-50">
                            <td className="px-3 py-2.5">
                                <p className="font-bold text-gray-900">{cliente.tipo_servicio || 'Servicio de Cable TV'}</p>
                                <p className="text-[8px] text-gray-600 mt-0.5">
                                    ✓ {mesesPagados} {mesesPagados === 1 ? 'mes' : 'meses'} pagado{mesesPagados !== 1 ? 's' : ''}
                                </p>
                            </td>
                            <td className="text-center px-2 py-2.5 font-semibold capitalize text-gray-900">
                                {rangoMeses}
                            </td>
                            <td className="text-right px-2 py-2.5 font-bold">
                                S/ {precioMensual.toFixed(2)}
                            </td>
                            <td className="text-right px-2 py-2.5 font-black text-lg text-green-700">
                                S/ {monto.toFixed(2)}
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                {/* TOTAL - DESTACADO */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-3 flex justify-between items-center border-t-2 border-gray-400">
                    <span className="text-[10px] font-black uppercase tracking-wider">Total a Pagar</span>
                    <span className="text-2xl font-black">S/ {monto.toFixed(2)}</span>
                </div>
            </div>

            {/* INFORMACIÓN DE PAGO */}
            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="border-2 border-gray-400 p-2 rounded bg-gray-50">
                    <p className="text-[8px] text-gray-600 font-bold uppercase mb-1">💳 Método</p>
                    <p className="text-[10px] font-black text-gray-900">{pago.metodo_pago || 'Efectivo'}</p>
                </div>
                <div className="border-2 border-gray-400 p-2 rounded bg-gray-50">
                    <p className="text-[8px] text-gray-600 font-bold uppercase mb-1">📌 Recibo</p>
                    <p className="text-[10px] font-black">{pago.numero_recibo || `#${pago.id}`}</p>
                </div>
                <div className="border-2 border-green-500 p-2 rounded bg-green-50">
                    <p className="text-[8px] text-green-700 font-bold uppercase mb-1">✓ Estado</p>
                    <p className="text-[10px] font-black text-green-700">PAGADO</p>
                </div>
            </div>

            {/* OBSERVACIONES */}
            {pago.observaciones && (
                <div className="border-2 border-orange-400 p-2 mb-3 rounded bg-orange-50">
                    <p className="text-[8px] text-orange-700 font-bold uppercase mb-1">📝 Observaciones</p>
                    <p className="text-[9px] text-gray-900">{pago.observaciones}</p>
                </div>
            )}

            {/* VERIFICACIÓN */}
            <div className="flex items-center justify-center gap-2 p-2 bg-green-50 border-2 border-green-400 rounded mb-3">
                <CheckCircle size={16} className="text-green-600" />
                <p className="text-[8px] font-bold text-green-700 uppercase">Pago Verificado y Registrado</p>
            </div>

            {/* FIRMAS */}
            <div className="grid grid-cols-2 gap-6 mt-2 mb-2">
                <div className="text-center">
                    <div className="border-t-2 border-gray-900 pt-1 mt-3">
                        <p className="text-[8px] font-bold">FIRMA DEL CLIENTE</p>
                        <p className="text-[7px] text-gray-600 mt-1">DNI: {cliente.dni}</p>
                    </div>
                </div>
                <div className="text-center">
                    <div className="border-t-2 border-gray-900 pt-1 mt-3">
                        <p className="text-[8px] font-bold">FIRMA Y SELLO</p>
                        <p className="text-[7px] text-gray-600 mt-1">TV JHAIRE</p>
                    </div>
                </div>
            </div>

            {/* PIE */}
            <div className="text-center text-[7px] text-gray-600 border-t-2 border-gray-400 pt-1">
                <p className="font-bold">🌐 www.tvjhaire.com | 📧 contacto@tvjhaire.com</p>
                <p className="text-[6px] mt-0.5 text-gray-500">Documento generado automáticamente - Conserve este comprobante</p>
            </div>
        </div>
    );
    
    return (
        <div id="recibo-print" className="w-full bg-white" style={{ fontFamily: 'Arial, sans-serif', fontSize: '9px' }}>
            {/* RECIBO 1 - ORIGINAL */}
            <ReciboIndividual esCopia={false} />
            
            {/* LÍNEA DE CORTE */}
            <div className="flex items-center justify-center gap-2 py-2 border-t-2 border-b-2 border-dashed border-gray-400 bg-gray-100">
                <Scissors size={16} className="text-gray-600" />
                <span className="text-[8px] font-bold text-gray-700 uppercase tracking-widest">✂️ Cortar por aquí ✂️</span>
                <Scissors size={16} className="text-gray-600" />
            </div>
            
            {/* RECIBO 2 - COPIA CLIENTE */}
            <ReciboIndividual esCopia={true} />
        </div>
    );
};

export default ReciboTemplate;
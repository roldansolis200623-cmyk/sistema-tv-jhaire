import React from 'react';
import { Scissors } from 'lucide-react';

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
        const fechaInicio = new Date(fecha);
        const fechaFin = new Date(fecha);
        fechaFin.setMonth(fechaInicio.getMonth() + mesesPagados - 1);
        
        const mesInicio = fechaInicio.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
        const mesFin = fechaFin.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
        
        if (mesesPagados === 1) {
            return mesInicio;
        } else {
            return `${mesInicio} - ${mesFin}`;
        }
    };
    
    const rangoMeses = generarRangoMeses();
    
    const ReciboIndividual = ({ esCopia = false }) => (
        <div className="bg-white px-6 py-3" style={{ height: '138mm' }}>
            {/* ENCABEZADO PROFESIONAL */}
            <div className="border-2 border-gray-800 p-2 mb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="TV Jhaire" className="h-8" />
                        <div>
                            <h1 className="text-lg font-bold text-gray-800" style={{ letterSpacing: '0.5px' }}>TV JHAIRE</h1>
                            <p className="text-[8px] text-gray-600 uppercase">Servicio de Telecomunicaciones</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-gray-800 text-white px-2 py-0.5 text-[9px] font-bold">
                            {esCopia ? 'COPIA CLIENTE' : 'ORIGINAL'}
                        </div>
                        <p className="text-[8px] text-gray-600 mt-0.5">RUC: 20608257536</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[8px] border-t border-gray-300 mt-1.5 pt-1.5">
                    <div>
                        <p>Cal. San Martín N° 773 - Tayabamba - Pataz</p>
                        <p>Tel: 951 151 453 / 997 115 410</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-gray-800 text-[10px]">
                            RECIBO N° {pago.numero_recibo || `${String(pago.id || '000').padStart(6, '0')}`}
                        </p>
                        <p className="text-[8px]">{fecha.toLocaleDateString('es-PE')}</p>
                    </div>
                </div>
            </div>

            {/* DATOS DEL CLIENTE */}
            <div className="border border-gray-400 p-2 mb-2">
                <p className="text-[8px] font-bold text-gray-700 mb-1 uppercase border-b border-gray-300 pb-0.5">Datos del Cliente</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px]">
                    <div>
                        <span className="text-gray-600">Cliente:</span>
                        <span className="font-bold ml-1">{cliente.nombre} {cliente.apellido}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">DNI:</span>
                        <span className="font-bold ml-1">{cliente.dni || 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                        <span className="text-gray-600">Dirección:</span>
                        <span className="ml-1">{cliente.direccion || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Teléfono:</span>
                        <span className="ml-1">{cliente.telefono || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* DETALLE DEL SERVICIO */}
            <div className="border border-gray-400 mb-2">
                <div className="bg-gray-800 text-white px-2 py-0.5">
                    <p className="text-[8px] font-bold uppercase">Detalle del Servicio</p>
                </div>
                <table className="w-full text-[9px]">
                    <thead className="bg-gray-100 border-b border-gray-300">
                        <tr>
                            <th className="text-left px-2 py-1 font-semibold">Descripción</th>
                            <th className="text-center px-2 py-1 font-semibold">Periodo</th>
                            <th className="text-right px-2 py-1 font-semibold">P.Unit</th>
                            <th className="text-right px-2 py-1 font-semibold">Importe</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-200">
                            <td className="px-2 py-1.5">
                                <p className="font-semibold">{cliente.tipo_servicio || 'Servicio de Cable TV'}</p>
                                <p className="text-[8px] text-gray-600">{mesesPagados} {mesesPagados === 1 ? 'mes' : 'meses'}</p>
                            </td>
                            <td className="text-center px-2 py-1.5 text-[8px] capitalize">
                                {rangoMeses}
                            </td>
                            <td className="text-right px-2 py-1.5 font-medium">
                                S/ {precioMensual.toFixed(2)}
                            </td>
                            <td className="text-right px-2 py-1.5 font-bold">
                                S/ {monto.toFixed(2)}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="bg-gray-100 px-2 py-1 border-t-2 border-gray-800 flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase">Total</span>
                    <span className="text-base font-bold">S/ {monto.toFixed(2)}</span>
                </div>
            </div>

            {/* INFORMACIÓN DE PAGO */}
            <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="border border-gray-400 p-1.5">
                    <p className="text-[8px] text-gray-600 uppercase">Método de Pago</p>
                    <p className="text-[10px] font-bold">{pago.metodo_pago || 'Efectivo'}</p>
                </div>
                <div className="border border-gray-400 p-1.5">
                    <p className="text-[8px] text-gray-600 uppercase">Estado</p>
                    <p className="text-[10px] font-bold text-green-700">PAGADO</p>
                </div>
            </div>

            {/* OBSERVACIONES */}
            {pago.observaciones && (
                <div className="border border-gray-400 p-1.5 mb-2">
                    <p className="text-[8px] text-gray-600 uppercase mb-0.5">Observaciones</p>
                    <p className="text-[9px]">{pago.observaciones}</p>
                </div>
            )}

            {/* FIRMAS */}
            <div className="grid grid-cols-2 gap-6 mt-3">
                <div className="text-center">
                    <div className="border-t border-gray-800 pt-0.5 mt-4">
                        <p className="text-[8px] font-bold">FIRMA DEL CLIENTE</p>
                        <p className="text-[7px] text-gray-600">DNI: {cliente.dni}</p>
                    </div>
                </div>
                <div className="text-center">
                    <div className="border-t border-gray-800 pt-0.5 mt-4">
                        <p className="text-[8px] font-bold">FIRMA Y SELLO</p>
                        <p className="text-[7px] text-gray-600">TV JHAIRE</p>
                    </div>
                </div>
            </div>

            {/* PIE DE PÁGINA */}
            <div className="border-t border-gray-400 mt-2 pt-1 text-center text-[7px] text-gray-600">
                <p className="font-semibold">www.tvjhaire.com | contacto@tvjhaire.com</p>
            </div>
        </div>
    );
    
    return (
        <div id="recibo-print" className="w-[210mm] mx-auto bg-white" style={{ fontFamily: 'Arial, sans-serif', fontSize: '9px' }}>
            {/* RECIBO 1 - OFICINA */}
            <ReciboIndividual esCopia={false} />
            
            {/* LÍNEA DE CORTE */}
            <div className="flex items-center justify-center gap-2 py-1 border-t border-b border-dashed border-gray-500 bg-gray-50">
                <Scissors size={14} className="text-gray-500" />
                <span className="text-[8px] font-bold text-gray-600 uppercase">Cortar por aquí</span>
                <Scissors size={14} className="text-gray-500" />
            </div>
            
            {/* RECIBO 2 - CLIENTE */}
            <ReciboIndividual esCopia={true} />
        </div>
    );
};

export default ReciboTemplate;















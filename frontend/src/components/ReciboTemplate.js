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
        // ✅ Si el recibo tiene meses_detalle, usarlo (es más preciso)
        if (pago.meses_detalle) {
            return pago.meses_detalle;
        }

        // Si no, generar rango genérico
        const mesesNombres = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const mesActual = fecha.getMonth();
        const añoActual = fecha.getFullYear();
        
        if (mesesPagados === 1) {
            return `${mesesNombres[mesActual]} ${añoActual}`;
        } else {
            // ✅ CORRECTAMENTE: El rango va HACIA ATRÁS desde el mes actual
            let mesInicio = mesActual - mesesPagados + 1;
            let mesFin = mesActual;
            let añoInicio = añoActual;
            
            // Ajustar si el mes inicial es negativo
            while (mesInicio < 0) {
                mesInicio += 12;
                añoInicio -= 1;
            }
            
            if (mesInicio === mesFin) {
                return `${mesesNombres[mesInicio]} ${añoInicio}`;
            }
            
            return `${mesesNombres[mesInicio]} - ${mesesNombres[mesFin]} ${añoActual}`;
        }
    };
    
    const rangoMeses = generarRangoMeses();
    
    const ReciboIndividual = ({ esCopia = false }) => (
        <div style={{ height: '140mm', pageBreakAfter: 'always', padding: '20px', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif', fontSize: '9px' }}>
            {/* ENCABEZADO */}
            <div style={{ border: '2px solid #1a1a1a', padding: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a', letterSpacing: '1px', margin: '0 0 4px 0' }}>📺 TV JHAIRE</h1>
                        <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#555', margin: '0' }}>SERVICIO DE TELECOMUNICACIONES</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ background: esCopia ? '#1976d2' : '#1a1a1a', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold', marginBottom: '4px' }}>
                            {esCopia ? '📋 COPIA CLIENTE' : '🔵 ORIGINAL'}
                        </div>
                        <p style={{ fontSize: '8px', fontWeight: 'bold', color: '#666', margin: '0' }}>RUC: 20608257536</p>
                    </div>
                </div>
                
                <div style={{ borderTop: '2px solid #999', borderBottom: '2px solid #999', padding: '8px 0', margin: '8px 0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '8px' }}>
                        <div style={{ fontWeight: 'bold' }}>
                            <p style={{ margin: '0 0 2px 0' }}>📍 Cal. San Martín N° 773</p>
                            <p style={{ margin: '0 0 2px 0' }}>Tayabamba - Pataz</p>
                            <p style={{ margin: '0' }}>📞 951 151 453 / 997 115 410</p>
                        </div>
                        <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            <p style={{ fontSize: '11px', color: '#1a1a1a', margin: '0 0 4px 0' }}>RECIBO #{pago.numero_recibo || `${String(pago.id || '000').padStart(5, '0')}`}</p>
                            <p style={{ fontSize: '9px', margin: '0' }}>📅 {fecha.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* DATOS DEL CLIENTE */}
            <div style={{ border: '2px solid #999', padding: '12px', marginBottom: '12px', borderRadius: '4px', backgroundColor: '#f0f4ff' }}>
                <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 8px 0', borderBottom: '2px solid #999', paddingBottom: '4px', textTransform: 'uppercase' }}>👤 Datos del Cliente</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '9px' }}>
                    <div>
                        <span style={{ color: '#666', fontWeight: 'bold' }}>Nombre:</span>
                        <p style={{ fontWeight: 'bold', color: '#1a1a1a', margin: '2px 0 0 0' }}>{cliente.nombre} {cliente.apellido}</p>
                    </div>
                    <div>
                        <span style={{ color: '#666', fontWeight: 'bold' }}>DNI:</span>
                        <p style={{ fontWeight: 'bold', color: '#1a1a1a', margin: '2px 0 0 0' }}>{cliente.dni || 'N/A'}</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ color: '#666', fontWeight: 'bold' }}>Dirección:</span>
                        <p style={{ fontWeight: 'bold', color: '#1a1a1a', margin: '2px 0 0 0' }}>{cliente.direccion || 'N/A'}</p>
                    </div>
                    <div>
                        <span style={{ color: '#666', fontWeight: 'bold' }}>Teléfono:</span>
                        <p style={{ fontWeight: 'bold', margin: '2px 0 0 0' }}>{cliente.telefono || 'N/A'}</p>
                    </div>
                    <div>
                        <span style={{ color: '#666', fontWeight: 'bold' }}>Suministro:</span>
                        <p style={{ fontWeight: 'bold', margin: '2px 0 0 0' }}>{cliente.numero_suministro || cliente.suministro || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* DETALLE DEL SERVICIO */}
            <div style={{ border: '2px solid #999', marginBottom: '12px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(to right, #1a1a1a, #333)', color: '#fff', padding: '8px 12px' }}>
                    <p style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0' }}>💰 Detalle del Servicio</p>
                </div>
                <table style={{ width: '100%', fontSize: '9px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#e0e0e0', borderBottom: '2px solid #999' }}>
                            <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>DESCRIPCIÓN</th>
                            <th style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold' }}>PERÍODO</th>
                            <th style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>P.UNIT</th>
                            <th style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>IMPORTE</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #ccc', backgroundColor: '#fafafa' }}>
                            <td style={{ padding: '10px' }}>
                                <p style={{ fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 4px 0' }}>{cliente.tipo_servicio || 'Servicio de Cable TV'}</p>
                                <p style={{ fontSize: '8px', color: '#666', margin: '0' }}>✓ {mesesPagados} {mesesPagados === 1 ? 'mes' : 'meses'} pagado{mesesPagados !== 1 ? 's' : ''}</p>
                            </td>
                            <td style={{ textAlign: 'center', padding: '10px', fontWeight: 'bold', textTransform: 'capitalize', color: '#1a1a1a' }}>
                                {rangoMeses}
                            </td>
                            <td style={{ textAlign: 'right', padding: '10px', fontWeight: 'bold' }}>
                                S/ {precioMensual.toFixed(2)}
                            </td>
                            <td style={{ textAlign: 'right', padding: '10px', fontWeight: 'bold', fontSize: '11px', color: '#2d5016' }}>
                                S/ {monto.toFixed(2)}
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                {/* TOTAL */}
                <div style={{ background: 'linear-gradient(to right, #28a745, #20c997)', color: '#fff', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #999' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total a Pagar</span>
                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>S/ {monto.toFixed(2)}</span>
                </div>
            </div>

            {/* INFORMACIÓN DE PAGO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div style={{ border: '2px solid #999', padding: '8px', borderRadius: '4px', backgroundColor: '#f5f5f5' }}>
                    <p style={{ fontSize: '8px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4px 0' }}>💳 Método</p>
                    <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#1a1a1a', margin: '0' }}>{pago.metodo_pago || 'Efectivo'}</p>
                </div>
                <div style={{ border: '2px solid #999', padding: '8px', borderRadius: '4px', backgroundColor: '#f5f5f5' }}>
                    <p style={{ fontSize: '8px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4px 0' }}>📌 Recibo</p>
                    <p style={{ fontSize: '10px', fontWeight: 'bold', margin: '0' }}>{pago.numero_recibo || `#${pago.id}`}</p>
                </div>
                <div style={{ border: '2px solid #28a745', padding: '8px', borderRadius: '4px', backgroundColor: '#f0fff4' }}>
                    <p style={{ fontSize: '8px', color: '#28a745', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4px 0' }}>✓ Estado</p>
                    <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#28a745', margin: '0' }}>PAGADO</p>
                </div>
            </div>

            {/* OBSERVACIONES */}
            {pago.observaciones && (
                <div style={{ border: '2px solid #ff9800', padding: '8px', marginBottom: '12px', borderRadius: '4px', backgroundColor: '#fff3e0' }}>
                    <p style={{ fontSize: '8px', color: '#e65100', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4px 0' }}>📝 Observaciones</p>
                    <p style={{ fontSize: '9px', color: '#1a1a1a', margin: '0' }}>{pago.observaciones}</p>
                </div>
            )}

            {/* VERIFICACIÓN */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', backgroundColor: '#f0fff4', border: '2px solid #28a745', borderRadius: '4px', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px' }}>✓</span>
                <p style={{ fontSize: '8px', fontWeight: 'bold', color: '#28a745', textTransform: 'uppercase', margin: '0' }}>Pago Verificado y Registrado</p>
            </div>

            {/* FIRMAS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '8px', marginBottom: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '2px solid #1a1a1a', paddingTop: '4px', marginTop: '12px' }}>
                        <p style={{ fontSize: '8px', fontWeight: 'bold', margin: '0' }}>FIRMA DEL CLIENTE</p>
                        <p style={{ fontSize: '7px', color: '#666', margin: '4px 0 0 0' }}>DNI: {cliente.dni}</p>
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '2px solid #1a1a1a', paddingTop: '4px', marginTop: '12px' }}>
                        <p style={{ fontSize: '8px', fontWeight: 'bold', margin: '0' }}>FIRMA Y SELLO</p>
                        <p style={{ fontSize: '7px', color: '#666', margin: '4px 0 0 0' }}>TV JHAIRE</p>
                    </div>
                </div>
            </div>

            {/* PIE */}
            <div style={{ textAlign: 'center', fontSize: '7px', color: '#666', borderTop: '2px solid #999', paddingTop: '4px' }}>
                <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>🌐 www.tvjhaire.com | 📧 contacto@tvjhaire.com</p>
                <p style={{ fontSize: '6px', color: '#999', margin: '0' }}>Documento generado automáticamente - Conserve este comprobante</p>
            </div>
        </div>
    );
    
    return (
        <div id="recibo-print" style={{ width: '100%', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif' }}>
            {/* RECIBO 1 - ORIGINAL */}
            <ReciboIndividual esCopia={false} />
            
            {/* LÍNEA DE CORTE */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', borderTop: '2px dashed #999', borderBottom: '2px dashed #999', backgroundColor: '#f5f5f5' }}>
                <span style={{ fontSize: '14px' }}>✂️</span>
                <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Cortar por aquí</span>
                <span style={{ fontSize: '14px' }}>✂️</span>
            </div>
            
            {/* RECIBO 2 - COPIA CLIENTE */}
            <ReciboIndividual esCopia={true} />
        </div>
    );
};

export default ReciboTemplate;
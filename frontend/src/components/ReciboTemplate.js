import React from 'react';

const ReciboTemplate = ({ pago, cliente }) => {
    if (!pago || !cliente) return null;

    const fecha = new Date(pago.fecha || pago.fecha_pago);
    const fechaFormato = fecha.toLocaleDateString('es-PE', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });

    const montoNum = parseFloat(pago.monto || 0);
    const mesesPagados = parseInt(pago.meses_pagados || 1);
    const precioPorMes = mesesPagados > 0 ? (montoNum / mesesPagados).toFixed(2) : '0.00';

    return (
        <div id="recibo-print" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff' }}>
            {/* HEADER */}
            <div style={{ textAlign: 'center', borderBottom: '3px solid #1a237e', paddingBottom: '15px', marginBottom: '20px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a237e', marginBottom: '5px' }}>
                    🎬 TV JHAIRE
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '3px' }}>
                    SERVICIO DE TELECOMUNICACIONES
                </div>
                <div style={{ fontSize: '11px', color: '#999' }}>
                    Cal. San Martín N° 773 - Tayabamba - Pataz
                </div>
                <div style={{ fontSize: '11px', color: '#999' }}>
                    Tel: 951 151 453 / 997 115 410
                </div>
            </div>

            {/* NÚMERO Y FECHA DEL RECIBO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #ddd' }}>
                <div>
                    <div style={{ fontSize: '11px', color: '#666' }}>NÚMERO DE RECIBO</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a237e' }}>
                        {pago.numero_recibo || `#${pago.id}`}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#666' }}>FECHA DE PAGO</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a237e' }}>
                        {fechaFormato}
                    </div>
                </div>
            </div>

            {/* DATOS DEL CLIENTE */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderLeft: '4px solid #1a237e', borderRadius: '4px' }}>
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>CLIENTE</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a237e' }}>
                        {cliente.nombre} {cliente.apellido}
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                        <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>DNI</div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                            {cliente.dni}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>TELÉFONO</div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                            {cliente.telefono || 'N/A'}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>DIRECCIÓN</div>
                        <div style={{ fontSize: '12px', color: '#333' }}>
                            {cliente.direccion || 'N/A'}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>SUMINISTRO</div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                            {cliente.numero_suministro || cliente.suministro || 'N/A'}
                        </div>
                    </div>
                </div>
            </div>

            {/* DETALLE DEL SERVICIO */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1a237e', marginBottom: '10px', textTransform: 'uppercase' }}>
                    DETALLE DEL SERVICIO
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#1a237e', color: '#fff' }}>
                            <th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', fontWeight: 'bold' }}>DESCRIPCIÓN</th>
                            <th style={{ padding: '10px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>MESES</th>
                            <th style={{ padding: '10px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold' }}>P.UNIT</th>
                            <th style={{ padding: '10px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold' }}>IMPORTE</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '12px', fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
                                {cliente.tipo_servicio || 'Servicio de Cable'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
                                {mesesPagados}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontSize: '12px', color: '#333' }}>
                                S/ {precioPorMes}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', color: '#1a237e' }}>
                                S/ {montoNum.toFixed(2)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* MESES PAGADOS */}
            {pago.meses_detalle && (
                <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#e3f2fd', borderLeft: '3px solid #1a237e', borderRadius: '3px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1a237e', marginBottom: '5px', textTransform: 'uppercase' }}>
                        PERÍODO PAGADO
                    </div>
                    <div style={{ fontSize: '12px', color: '#333', lineHeight: '1.6' }}>
                        {pago.meses_detalle}
                    </div>
                </div>
            )}

            {/* RESUMEN FINANCIERO */}
            <div style={{ marginBottom: '20px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', marginBottom: '5px' }}>MÉTODO DE PAGO</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', textTransform: 'capitalize' }}>
                            {pago.metodo_pago || 'Efectivo'}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', marginBottom: '5px' }}>ESTADO</div>
                        <div style={{ 
                            fontSize: '13px', 
                            fontWeight: 'bold', 
                            color: '#fff',
                            backgroundColor: '#4caf50',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            display: 'inline-block'
                        }}>
                            ✓ PAGADO
                        </div>
                    </div>
                </div>
            </div>

            {/* TOTAL */}
            <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#1a237e', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#b3e5fc', marginBottom: '5px', textTransform: 'uppercase' }}>
                    MONTO TOTAL PAGADO
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#fff' }}>
                    S/ {montoNum.toFixed(2)}
                </div>
            </div>

            {/* OBSERVACIONES */}
            {pago.observaciones && (
                <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#fff3e0', borderLeft: '3px solid #ff9800', borderRadius: '3px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ff6f00', marginBottom: '5px', textTransform: 'uppercase' }}>
                        OBSERVACIONES
                    </div>
                    <div style={{ fontSize: '12px', color: '#333' }}>
                        {pago.observaciones}
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #1a237e', textAlign: 'center' }}>
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '15px' }}>
                        Por favor conserve este comprobante como constancia de pago
                    </div>
                    <div style={{ fontSize: '10px', color: '#999', marginBottom: '5px' }}>
                        www.tvjhaire.com | contacto@tvjhaire.com
                    </div>
                    <div style={{ fontSize: '10px', color: '#999' }}>
                        RUC: 20068257536
                    </div>
                </div>
                <div style={{ fontSize: '10px', color: '#ccc', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
                    Comprobante generado automáticamente
                </div>
            </div>
        </div>
    );
};

export default ReciboTemplate;
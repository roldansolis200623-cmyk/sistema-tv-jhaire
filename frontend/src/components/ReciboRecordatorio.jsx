import React, { useRef } from 'react';
import { AlertTriangle, Phone, MessageCircle, CreditCard, Building2, Scan } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ReciboRecordatorio = ({ cliente, onClose }) => {
    const mesesDeuda = cliente.meses_deuda || 0;
    const montoMensual = parseFloat(cliente.precio_mensual) || 0;
    const totalDeuda = mesesDeuda * montoMensual;
    const reciboRef = useRef(null);

    // Número principal de Yape/Plin (Francisca)
    const numeroYape = '991569419';
    const qrData = numeroYape;

    const handlePrint = () => {
        window.print();
    };

    // 🆕 GENERAR PDF Y ENVIAR POR WHATSAPP
    const enviarPorWhatsApp = async () => {
        try {
            // Mostrar loading
            const loadingDiv = document.createElement('div');
            loadingDiv.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                     background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); 
                     z-index: 99999; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 10px;">📄</div>
                    <div style="font-weight: bold; color: #4F46E5;">Generando PDF...</div>
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">Esto tomará unos segundos</div>
                </div>
            `;
            document.body.appendChild(loadingDiv);

            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(reciboRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            const nombreArchivo = `recibo_${cliente.nombre}_${cliente.apellido}`.toLowerCase().replace(/\s+/g, '_');
            pdf.save(`${nombreArchivo}.pdf`);

            document.body.removeChild(loadingDiv);

            await new Promise(resolve => setTimeout(resolve, 800));

            const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`;
            const numeroCliente = cliente.telefono?.replace(/\D/g, '') || '';
            
            const mensaje = `Hola *${nombreCompleto}*,

📄 Te envío tu recibo de pago.

⚠️ *Deuda:* S/ ${totalDeuda.toFixed(2)} (${mesesDeuda} ${mesesDeuda === 1 ? 'mes' : 'meses'})

Por favor realiza tu pago para evitar la suspensión.

💳 *Métodos de pago en el recibo adjunto*

Gracias,
*TV Jhaire* 📺`;

            const mensajeCodificado = encodeURIComponent(mensaje);
            const url = numeroCliente 
                ? `https://wa.me/51${numeroCliente}?text=${mensajeCodificado}`
                : `https://wa.me/?text=${mensajeCodificado}`;
            
            window.open(url, '_blank');
            alert('✅ PDF descargado!\n\n📲 WhatsApp se abrirá.\n📎 Adjunta el PDF y envíalo.');

        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('❌ Error al generar el PDF.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* BOTONES DE ACCIÓN (NO SE IMPRIMEN) */}
                <div className="flex justify-end gap-3 p-4 border-b print:hidden">
                    <button
                        onClick={enviarPorWhatsApp}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <MessageCircle size={18} />
                        📲 WhatsApp
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        🖨️ Imprimir
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        ✕ Cerrar
                    </button>
                </div>

                {/* RECIBO OPTIMIZADO PARA A4 */}
                <div ref={reciboRef} className="p-4 bg-white" id="recibo-print">
                    <div className="border-4 border-indigo-600 rounded-lg overflow-hidden">
                        {/* CABECERA COMPACTA */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src="/logo.png" 
                                        alt="TV Jhaire" 
                                        className="h-12 w-auto bg-white rounded-lg p-1"
                                        crossOrigin="anonymous"
                                    />
                                    <div>
                                        <h1 className="text-xl font-bold">TV JHAIRE</h1>
                                        <p className="text-xs">TELECOMUNICACIONES</p>
                                    </div>
                                </div>
                                <div className="text-right text-xs">
                                    <div className="bg-white text-indigo-600 px-2 py-1 rounded font-bold text-xs">
                                        ORIGINAL
                                    </div>
                                    <p className="mt-1">RUC: 20608257536</p>
                                </div>
                            </div>
                        </div>

                        {/* DATOS EMPRESA */}
                        <div className="bg-gray-50 px-3 py-1 text-[10px] text-gray-700 border-b border-indigo-200">
                            <p>📍 Cal. San Martín N° 773 - Tayabamba - Pataz | 📞 951 151 453 / 997 115 410</p>
                        </div>

                        {/* ADVERTENCIA COMPACTA */}
                        <div className="bg-red-50 border-l-4 border-red-500 p-3 m-2">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="text-red-600" size={28} />
                                <div>
                                    <h2 className="text-lg font-bold text-red-600">⚠️ RECORDATORIO DE PAGO</h2>
                                    <p className="text-[10px] text-gray-600">Notificación de pago pendiente</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-2">
                                <p className="text-base text-gray-800 mb-1">Estimado(a) <span className="font-bold">{cliente.nombre} {cliente.apellido}</span></p>
                                <p className="text-xl font-bold text-red-600">
                                    Debes {mesesDeuda} {mesesDeuda === 1 ? 'mes' : 'meses'}: S/ {totalDeuda.toFixed(2)}
                                </p>
                                <p className="text-[11px] text-gray-600 mt-1">Paga antes de las 6:00 PM para evitar suspensión.</p>
                            </div>
                        </div>

                        {/* DATOS DEL CLIENTE COMPACTO */}
                        <div className="px-2 pb-2">
                            <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-200">
                                <h3 className="font-bold text-indigo-900 mb-1 text-sm">📋 Datos del Cliente</h3>
                                <div className="grid grid-cols-3 gap-2 text-[11px]">
                                    <div>
                                        <p className="text-gray-600">DNI:</p>
                                        <p className="font-bold text-gray-900">{cliente.dni}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Plan:</p>
                                        <p className="font-bold text-gray-900">{cliente.plan}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Mensual:</p>
                                        <p className="font-bold text-green-600">S/ {montoMensual.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PAGO RÁPIDO COMPACTO */}
                        <div className="px-2 pb-2">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-400">
                                <h3 className="text-base font-bold text-green-800 text-center mb-2">
                                    ⚡ PAGO RÁPIDO CON YAPE/PLIN
                                </h3>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* QR */}
                                    <div className="flex flex-col items-center">
                                        <div className="bg-white p-2 rounded-lg border-2 border-green-400">
                                            <QRCodeSVG 
                                                value={qrData}
                                                size={120}
                                                level="H"
                                                includeMargin={true}
                                            />
                                        </div>
                                        <p className="text-xs font-bold text-green-700 mt-1">991-569-419</p>
                                        <p className="text-[9px] text-gray-500">(Francisca)</p>
                                    </div>

                                    {/* Instrucciones */}
                                    <div className="flex flex-col justify-center">
                                        <div className="text-[10px] space-y-1">
                                            <p className="flex items-start gap-1">
                                                <span className="bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold flex-shrink-0">1</span>
                                                <span>Abre Yape/Plin</span>
                                            </p>
                                            <p className="flex items-start gap-1">
                                                <span className="bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold flex-shrink-0">2</span>
                                                <span>Escanea el QR</span>
                                            </p>
                                            <p className="flex items-start gap-1">
                                                <span className="bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold flex-shrink-0">3</span>
                                                <span>Paga <span className="font-bold">S/ {totalDeuda.toFixed(2)}</span></span>
                                            </p>
                                            <p className="flex items-start gap-1">
                                                <span className="bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold flex-shrink-0">4</span>
                                                <span>¡Listo! ✅</span>
                                            </p>
                                        </div>
                                        <div className="mt-2 p-1 bg-yellow-50 border border-yellow-400 rounded text-[9px]">
                                            <p className="font-bold">📸 Envía voucher al 951-451-453</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Monto */}
                                <div className="mt-2 text-center bg-white rounded-lg p-2 border border-green-400">
                                    <p className="text-[10px] text-gray-600">Total a pagar:</p>
                                    <p className="text-2xl font-bold text-green-700">S/ {totalDeuda.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {/* OTROS MEDIOS COMPACTO */}
                        <div className="px-2 pb-2">
                            <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-2 text-xs">💳 OTROS MEDIOS DE PAGO</h3>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Yape/Plin manual */}
                                    <div className="bg-white rounded p-1 border border-green-300">
                                        <h4 className="font-bold text-green-700 text-[10px] mb-1">📱 YAPE/PLIN</h4>
                                        <div className="text-[9px] space-y-0.5">
                                            <p>991-569-419 (Francisca)</p>
                                            <p>995-151-453 (Damian)</p>
                                        </div>
                                    </div>

                                    {/* Transferencias */}
                                    <div className="bg-white rounded p-1 border border-blue-300">
                                        <h4 className="font-bold text-blue-700 text-[10px] mb-1">🏦 BANCOS</h4>
                                        <div className="text-[9px] space-y-0.5">
                                            <p><span className="font-bold">BCP:</span> 570-04329682069</p>
                                            <p><span className="font-bold">Interbank:</span> 772-300-6808874</p>
                                            <p><span className="font-bold">BN:</span> 048-01086832</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER COMPACTO */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2">
                            <div className="flex items-center justify-between text-xs">
                                <div>
                                    <p className="font-bold">📞 951-451-453</p>
                                    <p className="text-[10px]">WhatsApp: 951-451-453</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">Telecomunicaciones Jhair EIRL</p>
                                    <p className="text-[9px]">Gracias por tu preferencia</p>
                                </div>
                            </div>
                        </div>

                        {/* NOTA FINAL */}
                        <div className="bg-gray-100 p-1 text-center text-[9px] text-gray-600">
                            <p>Fecha de emisión: {new Date().toLocaleDateString('es-PE')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ESTILOS DE IMPRESIÓN */}
            <style jsx>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #recibo-print,
                    #recibo-print * {
                        visibility: visible;
                    }
                    #recibo-print {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ReciboRecordatorio;
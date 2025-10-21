import React, { useRef } from 'react';
import { AlertTriangle, Phone, MessageCircle, CreditCard, Building2, Scan, Download } from 'lucide-react';
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

            // Esperar un poco para que el loading sea visible
            await new Promise(resolve => setTimeout(resolve, 500));

            // Capturar el recibo como imagen
            const canvas = await html2canvas(reciboRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // Crear PDF
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            // Generar nombre del archivo
            const nombreArchivo = `recibo_${cliente.nombre}_${cliente.apellido}`.toLowerCase().replace(/\s+/g, '_');
            
            // Descargar PDF
            pdf.save(`${nombreArchivo}.pdf`);

            // Remover loading
            document.body.removeChild(loadingDiv);

            // Esperar un poco para que el usuario vea que se descargó
            await new Promise(resolve => setTimeout(resolve, 800));

            // Preparar mensaje de WhatsApp
            const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`;
            const numeroCliente = cliente.telefono?.replace(/\D/g, '') || '';
            
            const mensaje = `Hola *${nombreCompleto}*,

📄 Te envío tu recibo de pago.

⚠️ *Deuda pendiente:* S/ ${totalDeuda.toFixed(2)}
📅 *Meses:* ${mesesDeuda}

Por favor revisa el documento adjunto y realiza tu pago para evitar la suspensión del servicio.

💳 *Puedes pagar escaneando el QR del recibo con Yape/Plin*

Gracias,
*TV Jhaire* 📺`;

            const mensajeCodificado = encodeURIComponent(mensaje);
            
            // Abrir WhatsApp
            const url = numeroCliente 
                ? `https://wa.me/51${numeroCliente}?text=${mensajeCodificado}`
                : `https://wa.me/?text=${mensajeCodificado}`;
            
            window.open(url, '_blank');

            // Mostrar instrucción
            alert('✅ PDF descargado exitosamente!\n\n📲 WhatsApp se abrirá en una nueva ventana.\n\n📎 Adjunta el PDF descargado y envíalo al cliente.');

        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('❌ Error al generar el PDF. Por favor intenta de nuevo.');
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

                {/* RECIBO PARA IMPRIMIR */}
                <div ref={reciboRef} className="p-8 bg-white" id="recibo-print">
                    {/* HEADER CON LOGO Y EMPRESA */}
                    <div className="border-4 border-indigo-600 rounded-lg overflow-hidden">
                        {/* CABECERA */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img 
                                        src="/logo.png" 
                                        alt="TV Jhaire" 
                                        className="h-16 w-auto bg-white rounded-lg p-2"
                                        crossOrigin="anonymous"
                                    />
                                    <div>
                                        <h1 className="text-2xl font-bold">TV JHAIRE</h1>
                                        <p className="text-sm">SERVICIO DE TELECOMUNICACIONES</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="bg-white text-indigo-600 px-3 py-1 rounded font-bold">
                                        ORIGINAL
                                    </div>
                                    <p className="text-xs mt-1">RUC: 20608257536</p>
                                </div>
                            </div>
                        </div>

                        {/* DATOS DE LA EMPRESA */}
                        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-700 border-b-2 border-indigo-200">
                            <p>📍 Cal. San Martín N° 773 - Tayabamba - Pataz</p>
                            <p>📞 Tel: 951 151 453 / 997 115 410</p>
                        </div>

                        {/* ADVERTENCIA PRINCIPAL */}
                        <div className="bg-red-50 border-l-4 border-red-500 p-6 m-4">
                            <div className="flex items-center gap-3 mb-3">
                                <AlertTriangle className="text-red-600" size={40} />
                                <div>
                                    <h2 className="text-2xl font-bold text-red-600">
                                        ⚠️ RECORDATORIO IMPORTANTE
                                    </h2>
                                    <p className="text-sm text-gray-600">Notificación de pago pendiente</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 mt-3">
                                <p className="text-lg text-gray-800 mb-2">
                                    Estimado(a) cliente:
                                </p>
                                <p className="text-2xl font-bold text-red-600">
                                    Tienes {mesesDeuda} {mesesDeuda === 1 ? 'mes' : 'meses'} pendiente{mesesDeuda !== 1 ? 's' : ''} por S/ {totalDeuda.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    Para evitar la suspensión, realiza tu pago antes de las 6:00 PM.
                                </p>
                            </div>
                        </div>

                        {/* DATOS DEL CLIENTE */}
                        <div className="px-4 pb-4">
                            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                                <h3 className="font-bold text-indigo-900 mb-3 text-lg">📋 Datos del Cliente</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-600">Cliente:</p>
                                        <p className="font-bold text-gray-900">{cliente.nombre} {cliente.apellido}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">DNI:</p>
                                        <p className="font-bold text-gray-900">{cliente.dni}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Plan:</p>
                                        <p className="font-bold text-gray-900">{cliente.plan}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Precio Mensual:</p>
                                        <p className="font-bold text-green-600">S/ {montoMensual.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Tipo de Servicio:</p>
                                        <p className="font-bold text-gray-900">{cliente.tipo_servicio}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Estado:</p>
                                        <p className={`font-bold ${
                                            cliente.estado === 'activo' ? 'text-green-600' : 
                                            cliente.estado === 'suspendido' ? 'text-orange-600' : 
                                            'text-red-600'
                                        }`}>
                                            {cliente.estado?.toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 🆕 SECCIÓN DE PAGO RÁPIDO CON QR */}
                        <div className="px-4 pb-4">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-4 border-green-400 shadow-xl">
                                <div className="text-center mb-4">
                                    <h3 className="text-2xl font-bold text-green-800 flex items-center justify-center gap-2 mb-2">
                                        <Scan size={32} className="text-green-600" />
                                        ⚡ PAGO RÁPIDO
                                    </h3>
                                    <p className="text-sm text-gray-700 font-semibold">
                                        Escanea el QR y paga en segundos con Yape o Plin
                                    </p>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    {/* QR CODE */}
                                    <div className="flex-shrink-0">
                                        <div className="bg-white p-4 rounded-xl shadow-lg border-4 border-green-400">
                                            <QRCodeSVG 
                                                value={qrData}
                                                size={180}
                                                level="H"
                                                includeMargin={true}
                                            />
                                        </div>
                                        <div className="mt-3 text-center">
                                            <p className="text-xs text-gray-600 font-bold">Número de contacto</p>
                                            <p className="text-lg font-bold text-green-700">991-569-419</p>
                                            <p className="text-xs text-gray-500">(Francisca)</p>
                                        </div>
                                    </div>

                                    {/* INSTRUCCIONES */}
                                    <div className="flex-1">
                                        <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                                            <h4 className="font-bold text-green-800 mb-3 text-lg">📱 Cómo pagar:</h4>
                                            <ol className="space-y-2 text-sm">
                                                <li className="flex items-start gap-2">
                                                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">1</span>
                                                    <span className="text-gray-700">Abre tu app de <span className="font-bold">Yape</span> o <span className="font-bold">Plin</span></span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">2</span>
                                                    <span className="text-gray-700">Toca el botón <span className="font-bold">"Escanear QR"</span></span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">3</span>
                                                    <span className="text-gray-700">Escanea el código QR de arriba</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">4</span>
                                                    <span className="text-gray-700">Ingresa el monto: <span className="font-bold text-green-700">S/ {totalDeuda.toFixed(2)}</span></span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">5</span>
                                                    <span className="text-gray-700">¡Envía el pago y listo! ✅</span>
                                                </li>
                                            </ol>
                                            
                                            <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                                                <p className="text-xs text-gray-700 font-bold">
                                                    📸 Recuerda enviarnos tu voucher por WhatsApp al <span className="text-green-700">951-451-453</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* MONTO DESTACADO */}
                                <div className="mt-4 text-center bg-white rounded-lg p-4 border-2 border-green-400">
                                    <p className="text-sm text-gray-600 mb-1">Monto a pagar:</p>
                                    <p className="text-4xl font-bold text-green-700">S/ {totalDeuda.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {/* MÉTODOS DE PAGO TRADICIONALES */}
                        <div className="px-4 pb-4">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
                                    <CreditCard size={24} />
                                    💳 OTROS MEDIOS DE PAGO
                                </h3>

                                {/* YAPE/PLIN ALTERNATIVO */}
                                <div className="mb-4 bg-white rounded-lg p-3 border border-green-300">
                                    <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                                        <Phone size={18} />
                                        📱 YAPE / PLIN (Sin QR)
                                    </h4>
                                    <div className="text-sm space-y-1">
                                        <p>• <span className="font-bold">991-569-419</span> (Francisca)</p>
                                        <p>• <span className="font-bold">995-151-453</span> (Damian)</p>
                                    </div>
                                </div>

                                {/* TRANSFERENCIAS */}
                                <div className="bg-white rounded-lg p-3 border border-blue-300">
                                    <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                                        <Building2 size={18} />
                                        🏦 TRANSFERENCIAS BANCARIAS
                                    </h4>
                                    <div className="text-sm space-y-1">
                                        <p>• <span className="font-bold">BCP:</span> 570-04329682069 (Francisca)</p>
                                        <p>• <span className="font-bold">BCP:</span> 570-71655133-0-75 (Damian)</p>
                                        <p>• <span className="font-bold">Interbank:</span> 772-300-6808874</p>
                                        <p>• <span className="font-bold">Caja Trujillo:</span> 792-321005070</p>
                                        <p>• <span className="font-bold">Banco de la Nación:</span> 048-01086832</p>
                                    </div>
                                </div>

                                <div className="mt-3 bg-yellow-50 rounded-lg p-3 border border-yellow-300">
                                    <p className="text-sm text-gray-700">
                                        📄 <span className="font-bold">Envía tu voucher por WhatsApp</span>
                                    </p>
                                    <p className="text-sm text-green-600 font-bold">
                                        ✅ Confirmación inmediata
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold flex items-center gap-2">
                                        <Phone size={18} />
                                        📞 Consultas: 951-451-453
                                    </p>
                                    <p className="text-sm flex items-center gap-2 mt-1">
                                        <MessageCircle size={16} />
                                        WhatsApp: 951-451-453
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">Telecomunicaciones Jhair EIRL</p>
                                    <p className="text-xs">Gracias por tu preferencia</p>
                                </div>
                            </div>
                        </div>

                        {/* NOTA FINAL */}
                        <div className="bg-gray-100 p-3 text-center text-xs text-gray-600">
                            <p>Este es un mensaje automático de recordatorio de pago.</p>
                            <p className="font-bold mt-1">Fecha de emisión: {new Date().toLocaleDateString('es-PE')}</p>
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
import React from 'react';
import { AlertTriangle, Phone, MessageCircle, CreditCard, Building2, DollarSign } from 'lucide-react';

const ReciboRecordatorio = ({ cliente, onClose }) => {
    const mesesDeuda = cliente.meses_deuda || 0;
    const montoMensual = parseFloat(cliente.precio_mensual) || 0;
    const totalDeuda = mesesDeuda * montoMensual;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* BOTONES DE ACCIÓN (NO SE IMPRIMEN) */}
                <div className="flex justify-end gap-3 p-4 border-b print:hidden">
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
                <div className="p-8 bg-white" id="recibo-print">
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

                        {/* MÉTODOS DE PAGO */}
                        <div className="px-4 pb-4">
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <h3 className="font-bold text-green-900 mb-4 text-lg flex items-center gap-2">
                                    <CreditCard size={24} />
                                    💳 MEDIOS DE PAGO
                                </h3>

                                {/* YAPE/PLIN */}
                                <div className="mb-4 bg-white rounded-lg p-3 border border-green-300">
                                    <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                                        <Phone size={18} />
                                        📱 YAPE / PLIN
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
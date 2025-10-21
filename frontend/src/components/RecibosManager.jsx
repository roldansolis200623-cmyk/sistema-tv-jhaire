import React, { useState } from 'react';
import { FileText, Printer, CheckSquare } from 'lucide-react';
import ReciboRecordatorio from './ReciboRecordatorio';

const RecibosManager = ({ clientes }) => {
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [clientesSeleccionados, setClientesSeleccionados] = useState([]);
    const [imprimirTodos, setImprimirTodos] = useState(false);

    const clientesMorosos = clientes.filter(c => c.meses_deuda > 0);

    // Imprimir recibo individual
    const handleImprimirIndividual = (cliente) => {
        setClienteSeleccionado(cliente);
    };

    // Toggle selección de cliente
    const toggleSeleccion = (clienteId) => {
        setClientesSeleccionados(prev => 
            prev.includes(clienteId)
                ? prev.filter(id => id !== clienteId)
                : [...prev, clienteId]
        );
    };

    // Imprimir seleccionados
    const handleImprimirSeleccionados = () => {
        if (clientesSeleccionados.length === 0) {
            alert('Selecciona al menos un cliente');
            return;
        }
        // Aquí se imprimirían múltiples recibos
        alert(`Imprimiendo ${clientesSeleccionados.length} recibos...`);
    };

    // Imprimir todos los morosos
    const handleImprimirMorosos = () => {
        if (clientesMorosos.length === 0) {
            alert('No hay clientes morosos');
            return;
        }
        setImprimirTodos(true);
    };

    return (
        <>
            {/* BOTONES DE ACCIÓN MASIVA */}
            <div className="flex gap-3 mb-4">
                <button
                    onClick={handleImprimirMorosos}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    <Printer size={20} />
                    Imprimir Todos los Morosos ({clientesMorosos.length})
                </button>

                {clientesSeleccionados.length > 0 && (
                    <button
                        onClick={handleImprimirSeleccionados}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <CheckSquare size={20} />
                        Imprimir Seleccionados ({clientesSeleccionados.length})
                    </button>
                )}
            </div>

            {/* MODAL DE RECIBO INDIVIDUAL */}
            {clienteSeleccionado && (
                <ReciboRecordatorio
                    cliente={clienteSeleccionado}
                    onClose={() => setClienteSeleccionado(null)}
                />
            )}

            {/* MODAL DE IMPRESIÓN MASIVA */}
            {imprimirTodos && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md">
                        <h3 className="text-xl font-bold mb-4">Imprimiendo Recibos Masivos</h3>
                        <p className="text-gray-600 mb-4">
                            Se imprimirán {clientesMorosos.length} recibos de clientes morosos.
                        </p>
                        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                            {clientesMorosos.map(cliente => (
                                <div key={cliente.id} className="text-sm p-2 bg-gray-50 rounded">
                                    {cliente.nombre} {cliente.apellido} - {cliente.meses_deuda} mes(es)
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    window.print();
                                    setImprimirTodos(false);
                                }}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                🖨️ Imprimir Todos
                            </button>
                            <button
                                onClick={() => setImprimirTodos(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* RETORNAR FUNCIONES PARA USAR EN LA TABLA */}
            <div style={{ display: 'none' }}>
                {/* Esto es para exportar las funciones */}
            </div>
        </>
    );
};

// Componente de botón para cada fila de la tabla
export const BotonReciboCliente = ({ cliente, onImprimir }) => {
    if (cliente.meses_deuda === 0) return null;

    return (
        <button
            onClick={() => onImprimir(cliente)}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            title="Imprimir recibo de recordatorio"
        >
            <FileText size={16} />
            Recibo
        </button>
    );
};

export default RecibosManager;
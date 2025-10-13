import React, { useState, useEffect } from 'react';
import { X, Download, Search, Filter, Calendar, RefreshCw, TrendingUp, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const HistorialCompletoModal = ({ cliente, onClose }) => {
    const [historial, setHistorial] = useState({
        migraciones: [],
        estados: [],
        precios: [],
        cambios: []
    });
    const [filtroActivo, setFiltroActivo] = useState('todos');
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarHistorial();
    }, [cliente.id]);

    const cargarHistorial = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/historial/completo/${cliente.id}`);
            const data = await response.json();
            setHistorial(data);
            setLoading(false);
        } catch (error) {
            console.error('Error cargando historial:', error);
            setLoading(false);
        }
    };

    // Combinar todos los eventos en un timeline
    const obtenerEventosCombinados = () => {
        const eventos = [];

        // Migraciones
        historial.migraciones.forEach(m => {
            eventos.push({
                tipo: 'migracion',
                fecha: new Date(m.fecha_migracion),
                titulo: `Cambio de servicio: ${m.tipo_servicio_anterior} → ${m.tipo_servicio_nuevo}`,
                detalles: [
                    { label: 'Plan anterior', valor: m.plan_anterior },
                    { label: 'Plan nuevo', valor: m.plan_nuevo },
                    { label: 'Precio anterior', valor: `S/ ${m.precio_anterior}` },
                    { label: 'Precio nuevo', valor: `S/ ${m.precio_nuevo}` },
                    { label: 'Motivo', valor: m.motivo },
                    { label: 'Realizado por', valor: m.migrado_por }
                ],
                icon: RefreshCw,
                color: 'blue'
            });
        });

        // Estados
        historial.estados.forEach(e => {
            eventos.push({
                tipo: 'estado',
                fecha: new Date(e.fecha_cambio),
                titulo: e.estado_nuevo === 'Activo' ? 'Servicio Reactivado' : 'Servicio Suspendido',
                detalles: [
                    { label: 'Estado anterior', valor: e.estado_anterior },
                    { label: 'Estado nuevo', valor: e.estado_nuevo },
                    { label: 'Motivo', valor: e.motivo },
                    { label: 'Realizado por', valor: e.usuario },
                    e.fecha_reactivacion && { label: 'Reactivado el', valor: new Date(e.fecha_reactivacion).toLocaleString('es-PE') }
                ].filter(Boolean),
                icon: e.estado_nuevo === 'Activo' ? CheckCircle : XCircle,
                color: e.estado_nuevo === 'Activo' ? 'green' : 'red'
            });
        });

        // Cambios de precio
        historial.precios.forEach(p => {
            eventos.push({
                tipo: 'precio',
                fecha: new Date(p.fecha_cambio),
                titulo: 'Cambio de Precio',
                detalles: [
                    { label: 'Precio anterior', valor: `S/ ${p.precio_anterior}` },
                    { label: 'Precio nuevo', valor: `S/ ${p.precio_nuevo}` },
                    { label: 'Diferencia', valor: `S/ ${(p.precio_nuevo - p.precio_anterior).toFixed(2)}` },
                    { label: 'Motivo', valor: p.motivo },
                    { label: 'Realizado por', valor: p.usuario }
                ],
                icon: TrendingUp,
                color: 'yellow'
            });
        });

        // Cambios generales
        historial.cambios.forEach(c => {
            eventos.push({
                tipo: 'cambio',
                fecha: new Date(c.fecha_cambio),
                titulo: `Modificación: ${c.campo_modificado}`,
                detalles: [
                    { label: 'Valor anterior', valor: c.valor_anterior || 'N/A' },
                    { label: 'Valor nuevo', valor: c.valor_nuevo || 'N/A' },
                    { label: 'Motivo', valor: c.motivo },
                    { label: 'Realizado por', valor: c.usuario }
                ],
                icon: AlertCircle,
                color: 'purple'
            });
        });

        // Ordenar por fecha descendente
        return eventos.sort((a, b) => b.fecha - a.fecha);
    };

    const eventosFiltrados = () => {
        let eventos = obtenerEventosCombinados();

        // Filtrar por tipo
        if (filtroActivo !== 'todos') {
            eventos = eventos.filter(e => e.tipo === filtroActivo);
        }

        // Buscar
        if (busqueda) {
            eventos = eventos.filter(e => 
                e.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                e.detalles.some(d => d.valor?.toLowerCase().includes(busqueda.toLowerCase()))
            );
        }

        return eventos;
    };

    const exportarPDF = () => {
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Historial Completo del Cliente', 14, 20);
        
        // Info del cliente
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`Cliente: ${cliente.nombre_apellido}`, 14, 30);
        doc.text(`DNI: ${cliente.dni}`, 14, 36);
        doc.text(`Servicio: ${cliente.tipo_servicio}`, 14, 42);
        doc.text(`Fecha de generación: ${new Date().toLocaleString('es-PE')}`, 14, 48);
        
        // Línea separadora
        doc.setDrawColor(200);
        doc.line(14, 52, 196, 52);

        const eventos = eventosFiltrados();
        let yPos = 60;

        eventos.forEach((evento, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            // Fecha y título
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(evento.fecha.toLocaleString('es-PE'), 14, yPos);
            doc.setFontSize(12);
            doc.text(evento.titulo, 14, yPos + 6);
            
            // Detalles
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            yPos += 12;
            
            evento.detalles.forEach(detalle => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`${detalle.label}: ${detalle.valor}`, 20, yPos);
                yPos += 5;
            });

            yPos += 8;
            
            // Línea separadora
            if (index < eventos.length - 1) {
                doc.setDrawColor(220);
                doc.line(14, yPos, 196, yPos);
                yPos += 6;
            }
        });

        doc.save(`Historial_${cliente.nombre_apellido}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const colorClasses = {
        blue: { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-blue-600' },
        green: { bg: 'bg-green-500', border: 'border-green-400', text: 'text-green-600' },
        red: { bg: 'bg-red-500', border: 'border-red-400', text: 'text-red-600' },
        yellow: { bg: 'bg-yellow-500', border: 'border-yellow-400', text: 'text-yellow-600' },
        purple: { bg: 'bg-purple-500', border: 'border-purple-400', text: 'text-purple-600' }
    };

    const eventos = eventosFiltrados();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/20">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <Clock className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Historial Completo del Cliente</h2>
                                <p className="text-white/80 text-sm">{cliente.nombre_apellido} - DNI: {cliente.dni}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-full transition"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Barra de búsqueda y botones */}
                    <div className="flex gap-3 flex-wrap">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar en historial..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                        </div>
                        <button
                            onClick={exportarPDF}
                            className="bg-white/20 hover:bg-white/30 text-white px-5 py-2 rounded-full flex items-center gap-2 transition font-medium"
                        >
                            <Download size={18} />
                            Exportar PDF
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-4 flex gap-2 overflow-x-auto">
                    {[
                        { id: 'todos', label: 'Todos', count: obtenerEventosCombinados().length },
                        { id: 'estado', label: 'Suspensiones', count: historial.estados.length },
                        { id: 'migracion', label: 'Migraciones', count: historial.migraciones.length },
                        { id: 'precio', label: 'Precios', count: historial.precios.length },
                        { id: 'cambio', label: 'Cambios', count: historial.cambios.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFiltroActivo(tab.id)}
                            className={`px-4 py-2 rounded-full font-medium transition whitespace-nowrap ${
                                filtroActivo === tab.id
                                    ? 'bg-white text-indigo-600'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* Timeline */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center text-white py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                            <p>Cargando historial...</p>
                        </div>
                    ) : eventos.length === 0 ? (
                        <div className="text-center text-white py-12">
                            <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No se encontraron eventos</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {eventos.map((evento, index) => {
                                const Icon = evento.icon;
                                const colors = colorClasses[evento.color];
                                
                                return (
                                    <div key={index} className={`bg-gray-900/40 backdrop-blur-sm rounded-2xl p-5 border-l-4 ${colors.border}`}>
                                        <div className="flex items-start gap-4">
                                            <div className={`${colors.bg} p-3 rounded-full`}>
                                                <Icon className="text-white" size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-white font-bold text-lg">{evento.titulo}</h3>
                                                    <span className="text-white/70 text-sm">
                                                        {evento.fecha.toLocaleString('es-PE')}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {evento.detalles.map((detalle, idx) => (
                                                        <div key={idx} className="text-sm">
                                                            <span className="text-white/60">{detalle.label}: </span>
                                                            <span className="text-white font-medium">{detalle.valor}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/20 flex justify-between items-center">
                    <p className="text-white/80 text-sm">Total de eventos: {eventos.length}</p>
                    <button
                        onClick={onClose}
                        className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full transition font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HistorialCompletoModal;
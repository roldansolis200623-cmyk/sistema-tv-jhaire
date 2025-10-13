const ClienteModel = require('../models/clienteModel');
const pool = require('../config/database');
const XLSX = require('xlsx');

const reporteController = {
    // Exportar clientes a Excel
    exportarExcel: async (req, res) => {
        try {
            const clientes = await ClienteModel.getAll();

            // Formatear datos para Excel
            const datosExcel = clientes.map(cliente => ({
                'DNI': cliente.dni,
                'Nombre': cliente.nombre,
                'Apellido': cliente.apellido,
                'Teléfono': cliente.telefono,
                'Email': cliente.email,
                'Dirección': cliente.direccion,
                'Tipo Servicio': cliente.tipo_servicio,
                'Plan': cliente.plan,
                'Precio Mensual': cliente.precio_mensual,
                'Fecha Instalación': cliente.fecha_instalacion,
                'Estado': cliente.estado
            }));

            // Crear libro de Excel
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(datosExcel);

            // Ajustar ancho de columnas
            ws['!cols'] = [
                { wch: 12 }, // DNI
                { wch: 15 }, // Nombre
                { wch: 15 }, // Apellido
                { wch: 12 }, // Teléfono
                { wch: 25 }, // Email
                { wch: 30 }, // Dirección
                { wch: 15 }, // Tipo Servicio
                { wch: 20 }, // Plan
                { wch: 12 }, // Precio
                { wch: 15 }, // Fecha
                { wch: 10 }  // Estado
            ];

            XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

            // Generar buffer
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

            // Enviar archivo
            res.setHeader('Content-Disposition', 'attachment; filename=clientes.xlsx');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
        } catch (error) {
            console.error('Error exportando a Excel:', error);
            res.status(500).json({ error: 'Error exportando datos' });
        }
    },

    // Obtener estadísticas
    getEstadisticas: async (req, res) => {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_clientes,
                    COUNT(*) FILTER (WHERE estado = 'activo') as activos,
                    COUNT(*) FILTER (WHERE estado = 'suspendido') as suspendidos,
                    COUNT(*) FILTER (WHERE estado = 'cancelado') as cancelados,
                    SUM(precio_mensual) FILTER (WHERE estado = 'activo') as ingresos_mensuales,
                    AVG(precio_mensual) as precio_promedio
                FROM clientes
            `;
            const result = await pool.query(query);
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({ error: 'Error obteniendo estadísticas' });
        }
    }
};

module.exports = reporteController;
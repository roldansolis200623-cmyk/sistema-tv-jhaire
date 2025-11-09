const ClienteModel = require('../models/clienteModel');
const pool = require('../config/database');
const XLSX = require('xlsx');

const reporteController = {
    /**
     * ✅ MEJORADO: Exportar clientes a Excel simple (XLSX)
     * Incluye dirección y todos los campos importantes
     */
    exportarExcel: async (req, res) => {
        try {
            const clientes = await ClienteModel.getAll();

            // ✅ MEJORADO: Formatear datos con TODOS los campos
            const datosExcel = clientes.map(cliente => ({
                'ID': cliente.id,
                'DNI': cliente.dni,
                'Nombre Completo': `${cliente.nombre} ${cliente.apellido}`,
                'Teléfono': cliente.telefono || '-',
                'Email': cliente.email || '-',
                'Dirección': cliente.direccion || '-',          // ✅ AGREGADO
                'Suministro': cliente.suministro || '-',        // ✅ AGREGADO
                'Tipo Servicio': cliente.tipo_servicio,
                'Plan': cliente.plan || '-',
                'Precio Mensual': parseFloat(cliente.precio_mensual || 0).toFixed(2),
                'Fecha Instalación': cliente.fecha_instalacion ? 
                    new Date(cliente.fecha_instalacion).toLocaleDateString('es-PE') : '-',
                'Meses Deuda': cliente.meses_deuda || 0,        // ✅ AGREGADO
                'Estado Pago': (cliente.estado_pago || 'N/A').toUpperCase(), // ✅ AGREGADO
                'Estado Servicio': cliente.estado.toUpperCase()
            }));

            // Crear libro de Excel
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(datosExcel);

            // ✅ MEJORADO: Ajustar ancho de columnas
            ws['!cols'] = [
                { wch: 8 },  // ID
                { wch: 12 }, // DNI
                { wch: 28 }, // Nombre Completo
                { wch: 13 }, // Teléfono
                { wch: 28 }, // Email
                { wch: 45 }, // Dirección (MÁS ANCHO)
                { wch: 12 }, // Suministro
                { wch: 16 }, // Tipo Servicio
                { wch: 24 }, // Plan
                { wch: 13 }, // Precio
                { wch: 17 }, // Fecha Instalación
                { wch: 12 }, // Meses Deuda
                { wch: 14 }, // Estado Pago
                { wch: 15 }  // Estado Servicio
            ];

            XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

            // Generar buffer
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

            // Enviar archivo
            const fecha = new Date().toISOString().split('T')[0];
            res.setHeader('Content-Disposition', `attachment; filename=clientes_${fecha}.xlsx`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
        } catch (error) {
            console.error('Error exportando a Excel:', error);
            res.status(500).json({ error: 'Error exportando datos' });
        }
    },

    /**
     * ✅ MEJORADO: Obtener estadísticas completas
     */
    getEstadisticas: async (req, res) => {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_clientes,
                    COUNT(*) FILTER (WHERE estado = 'activo') as activos,
                    COUNT(*) FILTER (WHERE estado = 'suspendido') as suspendidos,
                    COUNT(*) FILTER (WHERE estado = 'cancelado') as cancelados,
                    COUNT(*) FILTER (WHERE meses_deuda = 0 AND estado = 'activo') as al_dia,
                    COUNT(*) FILTER (WHERE meses_deuda > 0 AND estado = 'activo') as con_deuda,
                    COUNT(*) FILTER (WHERE meses_deuda >= 3 AND estado = 'activo') as morosos,
                    SUM(precio_mensual) FILTER (WHERE estado = 'activo') as ingresos_mensuales,
                    SUM(precio_mensual * meses_deuda) as deuda_total,
                    AVG(precio_mensual) as precio_promedio,
                    AVG(meses_deuda) FILTER (WHERE meses_deuda > 0) as deuda_promedio
                FROM clientes
            `;
            const result = await pool.query(query);
            
            // Formatear respuesta
            const stats = result.rows[0];
            res.json({
                total_clientes: parseInt(stats.total_clientes),
                activos: parseInt(stats.activos),
                suspendidos: parseInt(stats.suspendidos),
                cancelados: parseInt(stats.cancelados),
                al_dia: parseInt(stats.al_dia),
                con_deuda: parseInt(stats.con_deuda),
                morosos: parseInt(stats.morosos),
                ingresos_mensuales: parseFloat(stats.ingresos_mensuales || 0).toFixed(2),
                deuda_total: parseFloat(stats.deuda_total || 0).toFixed(2),
                precio_promedio: parseFloat(stats.precio_promedio || 0).toFixed(2),
                deuda_promedio: parseFloat(stats.deuda_promedio || 0).toFixed(2),
                tasa_morosidad: stats.activos > 0 ? 
                    ((parseInt(stats.con_deuda) / parseInt(stats.activos)) * 100).toFixed(2) : 
                    '0.00'
            });
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({ error: 'Error obteniendo estadísticas' });
        }
    },

    /**
     * ✅ NUEVO: Obtener reporte por estado
     */
    getReportePorEstado: async (req, res) => {
        try {
            const { estado } = req.params;
            
            const query = `
                SELECT * FROM clientes
                WHERE estado = $1
                ORDER BY meses_deuda DESC, nombre ASC
            `;
            
            const result = await pool.query(query, [estado]);
            res.json(result.rows);
        } catch (error) {
            console.error('Error obteniendo reporte por estado:', error);
            res.status(500).json({ error: 'Error obteniendo reporte' });
        }
    },

    /**
     * ✅ NUEVO: Obtener clientes con deuda
     */
    getClientesConDeuda: async (req, res) => {
        try {
            const query = `
                SELECT 
                    id, dni, nombre, apellido, telefono, direccion,
                    tipo_servicio, plan, precio_mensual, meses_deuda,
                    estado_pago, (precio_mensual * meses_deuda) as deuda_total
                FROM clientes
                WHERE meses_deuda > 0
                ORDER BY meses_deuda DESC, deuda_total DESC
            `;
            
            const result = await pool.query(query);
            res.json(result.rows);
        } catch (error) {
            console.error('Error obteniendo clientes con deuda:', error);
            res.status(500).json({ error: 'Error obteniendo clientes con deuda' });
        }
    }
};

module.exports = reporteController;
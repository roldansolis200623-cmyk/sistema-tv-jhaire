const ClienteModel = require('../models/clienteModel');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const reporteExcelController = {
    /**
     * ✅ MEJORADO: Exportar clientes a Excel con formato profesional
     * - Incluye dirección completa
     * - Formato horizontal tipo Excel
     * - Colores por estado
     * - Zebra striping
     * - Resumen ejecutivo
     */
    exportarExcel: async (req, res) => {
        try {
            const clientes = await ClienteModel.getAll();

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Clientes', {
                pageSetup: { 
                    paperSize: 9, // A4
                    orientation: 'landscape', // ✅ HORIZONTAL
                    fitToPage: true,
                    fitToWidth: 1
                }
            });

            // ============================================
            // LOGO Y ENCABEZADO
            // ============================================
            const logoPath = path.join(__dirname, '../assets/logo.png');
            if (fs.existsSync(logoPath)) {
                const imageId = workbook.addImage({
                    filename: logoPath,
                    extension: 'png',
                });
                worksheet.addImage(imageId, {
                    tl: { col: 0, row: 0 },
                    ext: { width: 280, height: 90 }
                });
            }

            worksheet.getRow(1).height = 30;
            worksheet.getRow(2).height = 30;
            worksheet.getRow(3).height = 30;

            // Título principal
            worksheet.mergeCells('C1:M3');
            const titleCell = worksheet.getCell('C1');
            titleCell.value = 'REPORTE COMPLETO DE CLIENTES - TV JHAIRE';
            titleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
            titleCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4F46E5' } // Morado moderno
            };
            titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
            titleCell.border = {
                top: { style: 'medium' },
                left: { style: 'medium' },
                bottom: { style: 'medium' },
                right: { style: 'medium' }
            };

            // Fecha y total
            worksheet.mergeCells('C4:M4');
            const dateCell = worksheet.getCell('C4');
            const ahora = new Date();
            dateCell.value = `Generado: ${ahora.toLocaleDateString('es-PE', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })} | Total de clientes: ${clientes.length}`;
            dateCell.font = { italic: true, size: 10, bold: true };
            dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
            worksheet.getRow(4).height = 22;

            // ============================================
            // ✅ ENCABEZADOS MEJORADOS (FORMATO HORIZONTAL)
            // ============================================
            const headerRow = worksheet.getRow(5);
            headerRow.values = [
                'ID',
                'DNI', 
                'Nombre Completo',  // ✅ COMBINADO
                'Teléfono', 
                'Email', 
                'Dirección',        // ✅ AGREGADO
                'Suministro',       // ✅ AGREGADO
                'Tipo Servicio', 
                'Plan/Perfil', 
                'Precio (S/)',
                'Fecha Instalación', 
                'Meses Deuda',      // ✅ AGREGADO
                'Estado Pago',      // ✅ AGREGADO
                'Estado Servicio'
            ];

            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF6366F1' } // Azul/morado
            };
            headerRow.alignment = { 
                vertical: 'middle', 
                horizontal: 'center', 
                wrapText: true 
            };
            headerRow.height = 32;

            // Bordes para encabezado
            headerRow.eachCell((cell) => {
                cell.border = {
                    top: { style: 'medium', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'medium', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
            });

            // ============================================
            // ✅ DATOS DE CLIENTES CON COLORES
            // ============================================
            let rowIndex = 6;
            clientes.forEach((cliente, index) => {
                const row = worksheet.getRow(rowIndex);
                row.values = [
                    cliente.id,
                    cliente.dni,
                    `${cliente.nombre} ${cliente.apellido}`,  // ✅ NOMBRE COMPLETO
                    cliente.telefono || '-',
                    cliente.email || '-',
                    cliente.direccion || '-',                  // ✅ DIRECCIÓN
                    cliente.suministro || '-',                 // ✅ SUMINISTRO
                    cliente.tipo_servicio,
                    cliente.plan || '-',
                    parseFloat(cliente.precio_mensual || 0),
                    cliente.fecha_instalacion ? 
                        new Date(cliente.fecha_instalacion).toLocaleDateString('es-PE') : '-',
                    cliente.meses_deuda || 0,                  // ✅ MESES DEUDA
                    (cliente.estado_pago || 'N/A').toUpperCase(), // ✅ ESTADO PAGO
                    cliente.estado.toUpperCase()
                ];

                // ============================================
                // ✅ COLORES INTELIGENTES
                // ============================================
                let bgColor = 'FFFFFFFF'; // Blanco por defecto
                
                // Color según estado + deuda
                if (cliente.estado === 'suspendido') {
                    bgColor = 'FFFFF3CD'; // Amarillo claro
                } else if (cliente.estado === 'cancelado') {
                    bgColor = 'FFF8D7DA'; // Rojo claro
                } else if (cliente.estado === 'activo') {
                    if (cliente.meses_deuda === 0) {
                        bgColor = index % 2 === 0 ? 'FFD4EDDA' : 'FFE8F5E9'; // Verde claro
                    } else if (cliente.meses_deuda <= 2) {
                        bgColor = index % 2 === 0 ? 'FFFFF9E6' : 'FFFFFAED'; // Amarillo muy claro
                    } else {
                        bgColor = index % 2 === 0 ? 'FFFFE5E5' : 'FFFEF2F2'; // Rojo muy claro
                    }
                }

                // Si está al día con zebra striping
                if (cliente.estado === 'activo' && cliente.meses_deuda === 0) {
                    bgColor = index % 2 === 0 ? 'FFF3F4F6' : 'FFFFFFFF';
                }

                row.eachCell((cell, colNumber) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: bgColor }
                    };
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
                    };
                    cell.alignment = { vertical: 'middle' };
                });

                // Formato de moneda
                row.getCell(10).numFmt = '"S/ "#,##0.00';
                row.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };
                
                // ✅ COLORES POR MESES DE DEUDA
                const mesesDeudaCell = row.getCell(12);
                if (cliente.meses_deuda === 0) {
                    mesesDeudaCell.font = { bold: true, color: { argb: 'FF059669' } }; // Verde
                } else if (cliente.meses_deuda <= 2) {
                    mesesDeudaCell.font = { bold: true, color: { argb: 'FFD97706' } }; // Amarillo
                } else {
                    mesesDeudaCell.font = { bold: true, color: { argb: 'FFDC2626' } }; // Rojo
                }

                // ✅ COLORES POR ESTADO DE PAGO
                const estadoPagoCell = row.getCell(13);
                if (cliente.estado_pago === 'pagado' || cliente.estado_pago === 'al_dia') {
                    estadoPagoCell.font = { bold: true, color: { argb: 'FF059669' } };
                } else if (cliente.estado_pago === 'deudor') {
                    estadoPagoCell.font = { bold: true, color: { argb: 'FFD97706' } };
                } else {
                    estadoPagoCell.font = { bold: true, color: { argb: 'FFDC2626' } };
                }

                // ✅ COLORES POR ESTADO DE SERVICIO
                const estadoServicioCell = row.getCell(14);
                if (cliente.estado === 'activo') {
                    estadoServicioCell.font = { bold: true, color: { argb: 'FF059669' } };
                } else if (cliente.estado === 'suspendido') {
                    estadoServicioCell.font = { bold: true, color: { argb: 'FFD97706' } };
                } else {
                    estadoServicioCell.font = { bold: true, color: { argb: 'FFDC2626' } };
                }
                
                rowIndex++;
            });

            // ============================================
            // ✅ AJUSTAR ANCHOS DE COLUMNA
            // ============================================
            worksheet.columns = [
                { width: 8 },   // ID
                { width: 12 },  // DNI
                { width: 28 },  // Nombre Completo
                { width: 13 },  // Teléfono
                { width: 28 },  // Email
                { width: 45 },  // Dirección (MÁS ANCHO)
                { width: 12 },  // Suministro
                { width: 16 },  // Tipo Servicio
                { width: 24 },  // Plan
                { width: 13 },  // Precio
                { width: 17 },  // Fecha Instalación
                { width: 12 },  // Meses Deuda
                { width: 14 },  // Estado Pago
                { width: 15 }   // Estado Servicio
            ];

            // ============================================
            // ✅ RESUMEN EJECUTIVO MEJORADO
            // ============================================
            rowIndex++;
            rowIndex++;
            
            const resumenTituloRow = worksheet.getRow(rowIndex);
            resumenTituloRow.values = ['📊 RESUMEN EJECUTIVO'];
            worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
            resumenTituloRow.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
            resumenTituloRow.getCell(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4F46E5' }
            };
            resumenTituloRow.getCell(1).alignment = { 
                horizontal: 'center', 
                vertical: 'middle' 
            };
            resumenTituloRow.height = 28;
            
            const totalClientes = clientes.length;
            const totalActivos = clientes.filter(c => c.estado === 'activo').length;
            const totalSuspendidos = clientes.filter(c => c.estado === 'suspendido').length;
            const totalCancelados = clientes.filter(c => c.estado === 'cancelado').length;
            const clientesConDeuda = clientes.filter(c => c.meses_deuda > 0).length;
            const clientesAlDia = clientes.filter(c => c.meses_deuda === 0 && c.estado === 'activo').length;
            const totalIngresos = clientes
                .filter(c => c.estado === 'activo')
                .reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0);
            const deudaTotal = clientes.reduce((sum, c) => 
                sum + (parseFloat(c.precio_mensual || 0) * (c.meses_deuda || 0)), 0
            );

            const resumenData = [
                ['Métrica', 'Valor', 'Métrica', 'Valor'],
                ['Total Clientes:', totalClientes, 'Clientes Activos:', totalActivos],
                ['Clientes Suspendidos:', totalSuspendidos, 'Clientes Cancelados:', totalCancelados],
                ['Clientes al Día:', clientesAlDia, 'Clientes con Deuda:', clientesConDeuda],
                ['Ingreso Mensual Activo:', totalIngresos, 'Deuda Total Pendiente:', deudaTotal]
            ];

            resumenData.forEach((data, idx) => {
                rowIndex++;
                const row = worksheet.getRow(rowIndex);
                row.values = data;
                
                if (idx === 0) {
                    row.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF8B5CF6' }
                    };
                    row.alignment = { horizontal: 'center', vertical: 'middle' };
                } else {
                    row.getCell(1).font = { bold: true, size: 10 };
                    row.getCell(3).font = { bold: true, size: 10 };
                    
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: idx % 2 === 0 ? 'FFDBEAFE' : 'FFE9D5FF' }
                    };
                    
                    // Formato de moneda
                    if (idx === 4) {
                        row.getCell(2).numFmt = '"S/ "#,##0.00';
                        row.getCell(4).numFmt = '"S/ "#,##0.00';
                    }
                    
                    row.alignment = { vertical: 'middle' };
                }
                
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        bottom: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
                
                row.height = 24;
            });

            // ============================================
            // GENERAR Y ENVIAR ARCHIVO
            // ============================================
            const buffer = await workbook.xlsx.writeBuffer();
            const fecha = new Date().toISOString().split('T')[0];
            
            res.setHeader('Content-Disposition', `attachment; filename=Clientes_TVJhaire_${fecha}.xlsx`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
            
        } catch (error) {
            console.error('Error exportando a Excel:', error);
            res.status(500).json({ error: 'Error exportando datos' });
        }
    }
};

module.exports = reporteExcelController;
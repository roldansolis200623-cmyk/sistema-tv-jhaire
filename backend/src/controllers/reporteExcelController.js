const ClienteModel = require('../models/clienteModel');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const reporteExcelController = {
    exportarExcel: async (req, res) => {
        try {
            const clientes = await ClienteModel.getAll();

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Clientes', {
                pageSetup: { paperSize: 9, orientation: 'landscape' }
            });

            // Agregar logo (columnas A-B, filas 1-3)
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

            // Altura de las filas del encabezado
            worksheet.getRow(1).height = 30;
            worksheet.getRow(2).height = 30;
            worksheet.getRow(3).height = 30;

            // Título principal (columnas C-K, filas 1-3)
            worksheet.mergeCells('C1:K3');
            const titleCell = worksheet.getCell('C1');
            titleCell.value = 'REPORTE DE CLIENTES - SISTEMA TV/INTERNET';
            titleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
            titleCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };
            titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
            titleCell.border = {
                top: { style: 'medium' },
                left: { style: 'medium' },
                bottom: { style: 'medium' },
                right: { style: 'medium' }
            };

            // Fecha de generación (fila 4, solo columnas C-K)
            worksheet.mergeCells('C4:K4');
            const dateCell = worksheet.getCell('C4');
            dateCell.value = `Fecha de generación: ${new Date().toLocaleDateString('es-PE', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            })}`;
            dateCell.font = { italic: true, size: 10 };
            dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
            worksheet.getRow(4).height = 20;

            // FILA 5: Encabezados de la tabla (SIN fila vacía antes)
            const headerRow = worksheet.getRow(5);
            headerRow.values = [
                'DNI', 'Nombre', 'Apellido', 'Teléfono', 'Email', 
                'Dirección', 'Tipo Servicio', 'Plan', 'Precio Mensual', 
                'Fecha Instalación', 'Estado'
            ];

            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.height = 25;

            // Bordes para encabezado
            headerRow.eachCell((cell) => {
                cell.border = {
                    top: { style: 'medium', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'medium', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
            });

            // Datos de clientes (empiezan en fila 6)
            let rowIndex = 6;
            clientes.forEach(cliente => {
                const row = worksheet.getRow(rowIndex);
                row.values = [
                    cliente.dni,
                    cliente.nombre,
                    cliente.apellido,
                    cliente.telefono,
                    cliente.email || '-',
                    cliente.direccion || '-',
                    cliente.tipo_servicio,
                    cliente.plan || '-',
                    parseFloat(cliente.precio_mensual || 0),
                    cliente.fecha_instalacion ? new Date(cliente.fecha_instalacion).toLocaleDateString('es-PE') : '-',
                    cliente.estado.toUpperCase()
                ];

                // Colorear según estado
                let color = 'FFFFFFFF';
                if (cliente.estado === 'activo') color = 'FFD4EDDA';
                else if (cliente.estado === 'suspendido') color = 'FFFFF3CD';
                else if (cliente.estado === 'cancelado') color = 'FFF8D7DA';

                row.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: color }
                    };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    cell.alignment = { vertical: 'middle' };
                });

                // Formato de moneda para precio
                row.getCell(9).numFmt = '"S/ "#,##0.00';
                row.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };
                
                rowIndex++;
            });

            // Ajustar anchos de columna
            worksheet.columns = [
                { width: 12 },  // DNI
                { width: 15 },  // Nombre
                { width: 15 },  // Apellido
                { width: 13 },  // Teléfono
                { width: 28 },  // Email
                { width: 35 },  // Dirección
                { width: 15 },  // Tipo Servicio
                { width: 20 },  // Plan
                { width: 15 },  // Precio
                { width: 15 },  // Fecha
                { width: 12 }   // Estado
            ];

            // Resumen al final
            rowIndex++; // Fila vacía
            const resumenRow = worksheet.getRow(rowIndex);
            resumenRow.values = ['RESUMEN'];
            worksheet.mergeCells(`A${rowIndex}:B${rowIndex}`);
            resumenRow.font = { bold: true, size: 12 };
            resumenRow.getCell(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE7E6E6' }
            };
            
            const totalClientes = clientes.length;
            const totalActivos = clientes.filter(c => c.estado === 'activo').length;
            const totalIngresos = clientes.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0);

            rowIndex++;
            const row1 = worksheet.getRow(rowIndex);
            row1.values = ['Total Clientes:', totalClientes];
            
            rowIndex++;
            const row2 = worksheet.getRow(rowIndex);
            row2.values = ['Clientes Activos:', totalActivos];
            
            rowIndex++;
            const row3 = worksheet.getRow(rowIndex);
            row3.values = ['Ingresos Mensuales:', totalIngresos];
            row3.getCell(2).numFmt = '"S/ "#,##0.00';

            // Formato resumen
            [row1, row2, row3].forEach(row => {
                row.getCell(1).font = { bold: true };
                row.getCell(1).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF2F2F2' }
                };
            });

            // Generar archivo
            const buffer = await workbook.xlsx.writeBuffer();
            const fecha = new Date().toISOString().split('T')[0];
            
            res.setHeader('Content-Disposition', `attachment; filename=clientes_${fecha}.xlsx`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
        } catch (error) {
            console.error('Error exportando a Excel:', error);
            res.status(500).json({ error: 'Error exportando datos' });
        }
    }
};

module.exports = reporteExcelController;
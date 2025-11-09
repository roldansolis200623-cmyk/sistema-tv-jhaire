const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
    constructor() {
        this.logoPath = path.join(__dirname, '../assets/logo.png');
    }

    // ✅ MEJORADO: Crear documento en HORIZONTAL (Landscape)
    crearDocumento() {
        return new PDFDocument({
            size: 'A4',
            layout: 'landscape', // ✅ HORIZONTAL
            margins: {
                top: 40,
                bottom: 40,
                left: 40,
                right: 40
            }
        });
    }

    // Agregar encabezado con logo
    agregarEncabezado(doc, titulo) {
        // Logo (si existe)
        if (fs.existsSync(this.logoPath)) {
            try {
                doc.image(this.logoPath, 40, 35, { width: 80 });
            } catch (error) {
                console.log('Logo no disponible');
            }
        }

        // Título
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#4F46E5')
           .text(titulo, 140, 40, { align: 'left' });

        // Fecha de generación
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#6B7280')
           .text(`Generado: ${new Date().toLocaleString('es-PE')}`, 140, 62);

        // Línea separadora
        doc.strokeColor('#E5E7EB')
           .lineWidth(2)
           .moveTo(40, 90)
           .lineTo(802, 90) // 802 = ancho A4 landscape - margen
           .stroke();

        return doc;
    }

    // ✅ MEJORADO: Tabla HORIZONTAL con DIRECCIÓN y colores
    agregarTablaClientes(doc, clientes, y = 105) {
        const alturaFila = 18;
        const columnWidths = {
            dni: 55,
            nombre: 100,
            telefono: 65,
            direccion: 130, // ✅ AGREGADO
            servicio: 70,
            precio: 50,
            deuda: 40,
            estado: 55
        };
        
        let xPos = 40;
        
        // ============================================
        // ENCABEZADOS DE TABLA
        // ============================================
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor('#ffffff');

        // Fondo morado para encabezados
        doc.rect(40, y, 762, alturaFila).fill('#6366F1');

        doc.fillColor('#ffffff')
           .text('DNI', xPos + 2, y + 5, { width: columnWidths.dni })
           .text('Nombre Completo', xPos + columnWidths.dni + 2, y + 5, { width: columnWidths.nombre })
           .text('Teléfono', xPos + columnWidths.dni + columnWidths.nombre + 2, y + 5, { width: columnWidths.telefono })
           .text('Dirección', xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + 2, y + 5, { width: columnWidths.direccion })
           .text('Servicio', xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + columnWidths.direccion + 2, y + 5, { width: columnWidths.servicio })
           .text('Precio', xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + columnWidths.direccion + columnWidths.servicio + 2, y + 5, { width: columnWidths.precio })
           .text('Deuda', xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + columnWidths.direccion + columnWidths.servicio + columnWidths.precio + 2, y + 5, { width: columnWidths.deuda })
           .text('Estado', xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + columnWidths.direccion + columnWidths.servicio + columnWidths.precio + columnWidths.deuda + 2, y + 5, { width: columnWidths.estado });

        y += alturaFila;

        // ============================================
        // FILAS DE DATOS
        // ============================================
        doc.font('Helvetica').fontSize(8);

        clientes.forEach((cliente, index) => {
            // Verificar si necesita nueva página
            if (y > 520) { // 520 para landscape
                doc.addPage({ layout: 'landscape' });
                y = 40;
                
                // Repetir encabezados
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
                doc.rect(40, y, 762, alturaFila).fill('#6366F1');
                
                xPos = 40;
                doc.fillColor('#ffffff')
                   .text('DNI', xPos + 2, y + 5, { width: columnWidths.dni })
                   .text('Nombre Completo', xPos + columnWidths.dni + 2, y + 5, { width: columnWidths.nombre })
                   .text('Teléfono', xPos + columnWidths.dni + columnWidths.nombre + 2, y + 5, { width: columnWidths.telefono })
                   .text('Dirección', xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + 2, y + 5, { width: columnWidths.direccion })
                   .text('Servicio', xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + columnWidths.direccion + 2, y + 5, { width: columnWidths.servicio })
                   .text('Precio', xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + columnWidths.direccion + columnWidths.servicio + 2, y + 5, { width: columnWidths.precio })
                   .text('Deuda', xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + columnWidths.direccion + columnWidths.servicio + columnWidths.precio + 2, y + 5, { width: columnWidths.deuda })
                   .text('Estado', xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + columnWidths.direccion + columnWidths.servicio + columnWidths.precio + columnWidths.deuda + 2, y + 5, { width: columnWidths.estado });
                
                y += alturaFila;
                doc.font('Helvetica').fontSize(8);
            }

            // ✅ Color de fondo según estado
            let colorFondo = '#ffffff';
            if (cliente.estado === 'suspendido') {
                colorFondo = '#FEF3C7'; // Amarillo claro
            } else if (cliente.estado === 'cancelado') {
                colorFondo = '#FEE2E2'; // Rojo claro
            } else if (cliente.meses_deuda === 0) {
                colorFondo = '#D1FAE5'; // Verde claro
            } else if (index % 2 === 0) {
                colorFondo = '#F9FAFB'; // Gris claro (zebra)
            }
            
            doc.rect(40, y, 762, alturaFila).fill(colorFondo);

            // ✅ Color según estado de pago
            let colorTexto = '#000000';
            if (cliente.meses_deuda >= 3) {
                colorTexto = '#DC2626'; // Rojo (moroso)
            } else if (cliente.meses_deuda > 0) {
                colorTexto = '#F59E0B'; // Amarillo (deudor)
            } else {
                colorTexto = '#059669'; // Verde (al día)
            }

            xPos = 40;
            doc.fillColor(colorTexto)
               .text(cliente.dni || '-', xPos + 2, y + 5, { width: columnWidths.dni, ellipsis: true })
               .text(`${cliente.nombre || ''} ${cliente.apellido || ''}`.trim(), xPos + columnWidths.dni + 2, y + 5, { width: columnWidths.nombre, ellipsis: true })
               .text(cliente.telefono || '-', xPos + columnWidths.dni + columnWidths.nombre + 2, y + 5, { width: columnWidths.telefono, ellipsis: true })
               .text(cliente.direccion || '-', xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + 2, y + 5, { width: columnWidths.direccion, ellipsis: true }) // ✅ DIRECCIÓN
               .text(cliente.tipo_servicio || '-', xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + columnWidths.direccion + 2, y + 5, { width: columnWidths.servicio, ellipsis: true })
               .text(`S/ ${parseFloat(cliente.precio_mensual || 0).toFixed(2)}`, xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + columnWidths.direccion + columnWidths.servicio + 2, y + 5, { width: columnWidths.precio })
               .text((cliente.meses_deuda || '0').toString(), xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + columnWidths.direccion + columnWidths.servicio + columnWidths.precio + 2, y + 5, { width: columnWidths.deuda, align: 'center' });
            
            // Estado con color
            doc.font('Helvetica-Bold');
            if (cliente.meses_deuda === 0) {
                doc.fillColor('#059669').text('AL DÍA', xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + columnWidths.direccion + columnWidths.servicio + columnWidths.precio + columnWidths.deuda + 2, y + 5, { width: columnWidths.estado });
            } else if (cliente.meses_deuda >= 3) {
                doc.fillColor('#DC2626').text('MOROSO', xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + columnWidths.direccion + columnWidths.servicio + columnWidths.precio + columnWidths.deuda + 2, y + 5, { width: columnWidths.estado });
            } else {
                doc.fillColor('#F59E0B').text('DEUDOR', xPos + columnWidths.dni + columnWidths.nombre + columnWidths.telefono + columnWidths.direccion + columnWidths.servicio + columnWidths.precio + columnWidths.deuda + 2, y + 5, { width: columnWidths.estado });
            }
            doc.font('Helvetica');

            // Línea separadora sutil
            doc.strokeColor('#E5E7EB')
               .lineWidth(0.5)
               .moveTo(40, y + alturaFila)
               .lineTo(802, y + alturaFila)
               .stroke();

            y += alturaFila;
        });

        return y;
    }

    // ✅ MEJORADO: Resumen con diseño profesional
    agregarResumen(doc, estadisticas, y) {
        y += 15;

        // Verificar si necesita nueva página
        if (y > 480) {
            doc.addPage({ layout: 'landscape' });
            y = 40;
        }

        // Título resumen
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#4F46E5')
           .text('📊 RESUMEN EJECUTIVO', 40, y);

        y += 25;

        doc.fontSize(10).font('Helvetica');
        
        const resumenData = [
            { label: 'Total de Clientes:', valor: estadisticas.total, color: '#3B82F6' },
            { label: 'Clientes al Día:', valor: estadisticas.pagados, color: '#059669' },
            { label: 'Clientes Deudores:', valor: estadisticas.deudores, color: '#F59E0B' },
            { label: 'Clientes Morosos:', valor: estadisticas.morosos, color: '#DC2626' },
            { label: 'Ingreso Mensual:', valor: `S/ ${estadisticas.ingresos.toFixed(2)}`, color: '#10B981' }
        ];

        resumenData.forEach(({ label, valor, color }, index) => {
            const xPos = 40 + (index % 3) * 250; // 3 columnas
            const yPos = y + Math.floor(index / 3) * 30;
            
            // Caja con color
            doc.rect(xPos, yPos, 220, 25)
               .fillAndStroke(color + '20', color); // Color con transparencia
            
            doc.fillColor('#1F2937')
               .font('Helvetica')
               .text(label, xPos + 5, yPos + 5, { width: 120, continued: true })
               .font('Helvetica-Bold')
               .fillColor(color)
               .text(valor.toString(), { align: 'right', width: 90 });
        });

        return y + 80;
    }

    // Generar reporte general
    async generarReporteGeneral(clientes) {
        const doc = this.crearDocumento();
        
        this.agregarEncabezado(doc, 'REPORTE GENERAL DE CLIENTES');

        const estadisticas = {
            total: clientes.length,
            pagados: clientes.filter(c => c.meses_deuda === 0).length,
            deudores: clientes.filter(c => c.meses_deuda > 0 && c.meses_deuda < 3).length,
            morosos: clientes.filter(c => c.meses_deuda >= 3).length,
            ingresos: clientes.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0)
        };

        let y = this.agregarTablaClientes(doc, clientes);
        this.agregarResumen(doc, estadisticas, y);

        return doc;
    }

    // Generar reporte de deudores
    async generarReporteDeudores(clientes) {
        const deudores = clientes.filter(c => c.meses_deuda > 0);
        
        const doc = this.crearDocumento();
        this.agregarEncabezado(doc, 'REPORTE DE CLIENTES DEUDORES Y MOROSOS');

        const estadisticas = {
            total: deudores.length,
            pagados: 0,
            deudores: deudores.filter(c => c.meses_deuda < 3).length,
            morosos: deudores.filter(c => c.meses_deuda >= 3).length,
            ingresos: deudores.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0)
        };

        let y = this.agregarTablaClientes(doc, deudores);
        this.agregarResumen(doc, estadisticas, y);

        return doc;
    }

    // Generar reporte por tipo de servicio
    async generarReportePorServicio(clientes, tipoServicio) {
        const tipoNormalizado = tipoServicio
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
        
        const filtrados = clientes.filter(c => {
            if (!c.tipo_servicio) return false;
            
            const servicioCliente = c.tipo_servicio
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim();
            
            return servicioCliente === tipoNormalizado;
        });
        
        const doc = this.crearDocumento();
        this.agregarEncabezado(doc, `REPORTE - ${tipoServicio.toUpperCase()}`);

        const estadisticas = {
            total: filtrados.length,
            pagados: filtrados.filter(c => c.meses_deuda === 0).length,
            deudores: filtrados.filter(c => c.meses_deuda > 0 && c.meses_deuda < 3).length,
            morosos: filtrados.filter(c => c.meses_deuda >= 3).length,
            ingresos: filtrados.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0)
        };

        let y = this.agregarTablaClientes(doc, filtrados);
        this.agregarResumen(doc, estadisticas, y);

        return doc;
    }

    // Generar reporte por tipo de señal
    async generarReportePorSenal(clientes, tipoSenal) {
        const senalNormalizada = tipoSenal
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
        
        const filtrados = clientes.filter(c => {
            if (!c.tipo_senal) return false;
            
            const senalCliente = c.tipo_senal
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim();
            
            return senalCliente === senalNormalizada;
        });
        
        const doc = this.crearDocumento();
        this.agregarEncabezado(doc, `REPORTE - SEÑAL ${tipoSenal.toUpperCase()}`);

        const estadisticas = {
            total: filtrados.length,
            pagados: filtrados.filter(c => c.meses_deuda === 0).length,
            deudores: filtrados.filter(c => c.meses_deuda > 0 && c.meses_deuda < 3).length,
            morosos: filtrados.filter(c => c.meses_deuda >= 3).length,
            ingresos: filtrados.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0)
        };

        let y = this.agregarTablaClientes(doc, filtrados);
        this.agregarResumen(doc, estadisticas, y);

        return doc;
    }
}

module.exports = new PDFService();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
    constructor() {
        this.logoPath = path.join(__dirname, '../assets/logo.png');
    }

    // ✅ MEJORADO: Documento HORIZONTAL con márgenes optimizados
    crearDocumento() {
        return new PDFDocument({
            size: 'A4',
            layout: 'landscape', // HORIZONTAL
            margins: {
                top: 35,
                bottom: 35,
                left: 35,
                right: 35
            }
        });
    }

    // ✅ MEJORADO: Encabezado moderno y compacto
    agregarEncabezado(doc, titulo) {
        const pageWidth = 802; // A4 landscape width - margins
        
        // Logo (si existe)
        if (fs.existsSync(this.logoPath)) {
            try {
                doc.image(this.logoPath, 35, 30, { width: 70 });
            } catch (error) {
                console.log('Logo no disponible');
            }
        }

        // Título con gradiente visual
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#6366F1')
           .text(titulo, 120, 35);

        // Fecha de generación
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#6B7280')
           .text(`Generado: ${new Date().toLocaleString('es-PE')}`, 120, 52);

        // Línea separadora moderna
        doc.strokeColor('#E0E7FF')
           .lineWidth(2)
           .moveTo(35, 75)
           .lineTo(pageWidth + 35, 75)
           .stroke();

        return doc;
    }

    // ✅✅ MEGA MEJORADO: Tabla con MÁS ALTURA por fila y columnas anchas
    agregarTablaClientes(doc, clientes, y = 90) {
        const alturaFila = 28; // ✅ AUMENTADO de 18 a 28 (55% más espacio)
        
        // ✅ Columnas MÁS ANCHAS para que no se corten
        const columnWidths = {
            dni: 60,
            nombre: 130,     // ✅ AUMENTADO de 100 a 130
            telefono: 75,
            direccion: 160,  // ✅ AUMENTADO de 130 a 160
            servicio: 75,
            precio: 55,
            deuda: 45,
            estado: 60
        };
        
        const totalWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0);
        let xPos = 35;
        
        // ============================================
        // ENCABEZADOS DE TABLA - Diseño moderno
        // ============================================
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor('#ffffff');

        // Fondo degradado para encabezados
        doc.rect(35, y, totalWidth, alturaFila)
           .fillAndStroke('#6366F1', '#4F46E5');

        // Textos de encabezado centrados verticalmente
        const headerY = y + 9; // Centrado vertical
        doc.fillColor('#ffffff')
           .text('DNI', xPos + 2, headerY, { width: columnWidths.dni, align: 'center' });
        xPos += columnWidths.dni;
        
        doc.text('Nombre Completo', xPos + 2, headerY, { width: columnWidths.nombre, align: 'center' });
        xPos += columnWidths.nombre;
        
        doc.text('Teléfono', xPos + 2, headerY, { width: columnWidths.telefono, align: 'center' });
        xPos += columnWidths.telefono;
        
        doc.text('Dirección', xPos + 2, headerY, { width: columnWidths.direccion, align: 'center' });
        xPos += columnWidths.direccion;
        
        doc.text('Servicio', xPos + 2, headerY, { width: columnWidths.servicio, align: 'center' });
        xPos += columnWidths.servicio;
        
        doc.text('Precio', xPos + 2, headerY, { width: columnWidths.precio, align: 'center' });
        xPos += columnWidths.precio;
        
        doc.text('Deuda', xPos + 2, headerY, { width: columnWidths.deuda, align: 'center' });
        xPos += columnWidths.deuda;
        
        doc.text('Estado', xPos + 2, headerY, { width: columnWidths.estado, align: 'center' });

        y += alturaFila;

        // ============================================
        // FILAS DE DATOS con más espacio
        // ============================================
        doc.font('Helvetica').fontSize(8);

        clientes.forEach((cliente, index) => {
            // Verificar si necesita nueva página
            if (y > 500) { // Límite para landscape
                doc.addPage({ layout: 'landscape' });
                y = 35;
                
                // Repetir encabezados
                xPos = 35;
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
                doc.rect(35, y, totalWidth, alturaFila).fillAndStroke('#6366F1', '#4F46E5');
                
                const headerY2 = y + 9;
                doc.fillColor('#ffffff')
                   .text('DNI', xPos + 2, headerY2, { width: columnWidths.dni, align: 'center' });
                xPos += columnWidths.dni;
                doc.text('Nombre Completo', xPos + 2, headerY2, { width: columnWidths.nombre, align: 'center' });
                xPos += columnWidths.nombre;
                doc.text('Teléfono', xPos + 2, headerY2, { width: columnWidths.telefono, align: 'center' });
                xPos += columnWidths.telefono;
                doc.text('Dirección', xPos + 2, headerY2, { width: columnWidths.direccion, align: 'center' });
                xPos += columnWidths.direccion;
                doc.text('Servicio', xPos + 2, headerY2, { width: columnWidths.servicio, align: 'center' });
                xPos += columnWidths.servicio;
                doc.text('Precio', xPos + 2, headerY2, { width: columnWidths.precio, align: 'center' });
                xPos += columnWidths.precio;
                doc.text('Deuda', xPos + 2, headerY2, { width: columnWidths.deuda, align: 'center' });
                xPos += columnWidths.deuda;
                doc.text('Estado', xPos + 2, headerY2, { width: columnWidths.estado, align: 'center' });
                
                y += alturaFila;
                doc.font('Helvetica').fontSize(8);
            }

            // ✅ Colores profesionales según estado
            let colorFondo = '#ffffff';
            if (cliente.estado === 'suspendido') {
                colorFondo = '#FEF3C7';
            } else if (cliente.estado === 'cancelado') {
                colorFondo = '#FEE2E2';
            } else if (cliente.meses_deuda === 0) {
                colorFondo = '#D1FAE5';
            } else if (cliente.meses_deuda >= 3) {
                colorFondo = '#FEE2E2';
            } else if (index % 2 === 0) {
                colorFondo = '#F9FAFB';
            }
            
            // Rectángulo de fondo
            doc.rect(35, y, totalWidth, alturaFila).fill(colorFondo);

            // ✅ Color de texto según meses de deuda
            let colorTexto = '#000000';
            if (cliente.meses_deuda >= 3) {
                colorTexto = '#DC2626'; // Rojo moroso
            } else if (cliente.meses_deuda > 0) {
                colorTexto = '#F59E0B'; // Naranja deudor
            } else {
                colorTexto = '#059669'; // Verde al día
            }

            // ✅ Centrado vertical del texto (importante para que se vea bien)
            const textY = y + 10; // Centrado vertical en la fila de 28px de altura
            
            xPos = 35;
            
            // DNI
            doc.fillColor(colorTexto)
               .font('Helvetica')
               .text(cliente.dni || '-', xPos + 3, textY, { 
                   width: columnWidths.dni - 6, 
                   ellipsis: true,
                   align: 'left'
               });
            xPos += columnWidths.dni;
            
            // Nombre Completo - ✅ MÁS ANCHO para que no se corte
            doc.text(`${cliente.nombre || ''} ${cliente.apellido || ''}`.trim(), 
                     xPos + 3, textY, { 
                         width: columnWidths.nombre - 6, 
                         ellipsis: true 
                     });
            xPos += columnWidths.nombre;
            
            // Teléfono
            doc.text(cliente.telefono || '-', xPos + 3, textY, { 
                width: columnWidths.telefono - 6, 
                ellipsis: true 
            });
            xPos += columnWidths.telefono;
            
            // Dirección - ✅ MÁS ANCHO
            doc.fillColor('#374151')
               .text(cliente.direccion || '-', xPos + 3, textY, { 
                   width: columnWidths.direccion - 6, 
                   ellipsis: true 
               });
            xPos += columnWidths.direccion;
            
            // Servicio
            doc.fillColor(colorTexto)
               .text(cliente.tipo_servicio || '-', xPos + 3, textY, { 
                   width: columnWidths.servicio - 6, 
                   ellipsis: true 
               });
            xPos += columnWidths.servicio;
            
            // Precio
            doc.text(`S/ ${parseFloat(cliente.precio_mensual || 0).toFixed(2)}`, 
                     xPos + 3, textY, { 
                         width: columnWidths.precio - 6,
                         align: 'right'
                     });
            xPos += columnWidths.precio;
            
            // Deuda
            doc.font('Helvetica-Bold')
               .text((cliente.meses_deuda || '0').toString(), 
                     xPos + 3, textY, { 
                         width: columnWidths.deuda - 6, 
                         align: 'center' 
                     });
            xPos += columnWidths.deuda;
            
            // Estado
            doc.font('Helvetica-Bold');
            let estadoTexto = 'AL DÍA';
            let estadoColor = '#059669';
            
            if (cliente.meses_deuda >= 3) {
                estadoTexto = 'MOROSO';
                estadoColor = '#DC2626';
            } else if (cliente.meses_deuda > 0) {
                estadoTexto = 'DEUDOR';
                estadoColor = '#F59E0B';
            }
            
            doc.fillColor(estadoColor)
               .text(estadoTexto, xPos + 3, textY, { 
                   width: columnWidths.estado - 6,
                   align: 'center'
               });

            // Línea separadora muy sutil
            doc.strokeColor('#E5E7EB')
               .lineWidth(0.5)
               .moveTo(35, y + alturaFila)
               .lineTo(35 + totalWidth, y + alturaFila)
               .stroke();

            y += alturaFila;
            doc.font('Helvetica');
        });

        return y;
    }

    // ✅ MEJORADO: Resumen ejecutivo moderno
    agregarResumen(doc, estadisticas, y) {
        y += 20;

        // Verificar espacio
        if (y > 450) {
            doc.addPage({ layout: 'landscape' });
            y = 35;
        }

        // Título resumen
        doc.fontSize(13)
           .font('Helvetica-Bold')
           .fillColor('#4F46E5')
           .text('📊 RESUMEN EJECUTIVO', 35, y);

        y += 30;

        doc.fontSize(10).font('Helvetica');
        
        const resumenData = [
            { label: 'Total Clientes', valor: estadisticas.total, color: '#3B82F6', icon: '👥' },
            { label: 'Al Día', valor: estadisticas.pagados, color: '#059669', icon: '✅' },
            { label: 'Deudores', valor: estadisticas.deudores, color: '#F59E0B', icon: '⚠️' },
            { label: 'Morosos', valor: estadisticas.morosos, color: '#DC2626', icon: '🚨' },
            { label: 'Ingreso Mensual', valor: `S/ ${estadisticas.ingresos.toFixed(2)}`, color: '#10B981', icon: '💰' }
        ];

        resumenData.forEach(({ label, valor, color, icon }, index) => {
            const xPos = 35 + (index % 5) * 150;
            const yPos = y + Math.floor(index / 5) * 45;
            
            // Caja moderna con sombra
            doc.rect(xPos, yPos, 140, 35)
               .fillAndStroke(color + '15', color);
            
            // Icono
            doc.fontSize(14)
               .fillColor('#000000')
               .text(icon, xPos + 8, yPos + 8);
            
            // Label
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor('#6B7280')
               .text(label, xPos + 30, yPos + 8, { width: 100 });
            
            // Valor
            doc.fontSize(13)
               .font('Helvetica-Bold')
               .fillColor(color)
               .text(valor.toString(), xPos + 30, yPos + 18, { width: 100 });
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
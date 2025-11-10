const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
    constructor() {
        this.logoPath = path.join(__dirname, '../assets/logo.png');
        
        // Dimensiones exactas A4 landscape
        this.pageWidth = 841.89; // A4 landscape en puntos
        this.pageHeight = 595.28; // A4 landscape en puntos
        this.margin = 30;
        this.contentWidth = this.pageWidth - (this.margin * 2); // 781.89
        
        // Paleta de colores
        this.colors = {
            primary: '#6366F1',
            secondary: '#8B5CF6',
            success: '#10B981',
            warning: '#F59E0B',
            danger: '#EF4444',
            info: '#3B82F6',
            dark: '#1F2937',
            light: '#F3F4F6',
            white: '#FFFFFF',
            
            alDia: '#10B981',
            deudor: '#F59E0B',
            moroso: '#EF4444',
            
            bgSuccess: '#D1FAE5',
            bgWarning: '#FEF3C7',
            bgDanger: '#FEE2E2',
            bgInfo: '#DBEAFE',
            bgLight: '#F9FAFB'
        };
    }

    crearDocumento() {
        return new PDFDocument({
            size: 'A4',
            layout: 'landscape', // 841.89 x 595.28 puntos
            margins: {
                top: this.margin,
                bottom: this.margin,
                left: this.margin,
                right: this.margin
            },
            bufferPages: true,
            autoFirstPage: true
        });
    }

    // Encabezado que NO se sale del A4
    agregarEncabezado(doc, titulo) {
        // Fondo degradado que respeta el ancho total
        doc.rect(0, 0, this.pageWidth, 85).fill(this.colors.primary);
        doc.rect(0, 60, this.pageWidth, 25)
           .fillOpacity(0.3)
           .fill(this.colors.secondary)
           .fillOpacity(1);
        
        // Logo
        if (fs.existsSync(this.logoPath)) {
            try {
                doc.image(this.logoPath, 40, 22, { width: 80, height: 45 });
            } catch (error) {
                doc.fontSize(20)
                   .font('Helvetica-Bold')
                   .fillColor(this.colors.white)
                   .text('TV JHAIRE', 40, 30);
            }
        }
        
        // Título
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fillColor(this.colors.white)
           .text(titulo.toUpperCase(), 140, 25, {
               width: this.contentWidth - 250,
               align: 'left'
           });
        
        // Info empresa
        doc.fontSize(8)
           .font('Helvetica')
           .fillOpacity(0.9)
           .text('TELECOMUNICACIONES JHAIR EIRL', 140, 48)
           .text('RUC: 20606847291 | Trujillo, La Libertad', 140, 58)
           .fillOpacity(1);
        
        // Badge fecha - respeta margen derecho
        const ahora = new Date();
        const fechaTexto = ahora.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        const horaTexto = ahora.toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const badgeX = this.pageWidth - 140; // Respeta margen
        doc.roundedRect(badgeX, 25, 130, 40, 5)
           .fillOpacity(0.2)
           .fill(this.colors.white)
           .fillOpacity(1);
        
        doc.fontSize(7)
           .font('Helvetica')
           .fillColor(this.colors.white)
           .fillOpacity(0.8)
           .text('GENERADO', badgeX + 10, 30)
           .fillOpacity(1);
        
        doc.fontSize(8)
           .font('Helvetica-Bold')
           .fillColor(this.colors.white)
           .text(fechaTexto, badgeX + 10, 42, { width: 110 })
           .text(horaTexto, badgeX + 10, 53, { width: 110 });
        
        return doc;
    }

    // Tabla optimizada que CABE en A4 landscape
    agregarTablaClientes(doc, clientes, y = 95) {
        const alturaFila = 28;
        const maxY = this.pageHeight - this.margin - 10; // Límite antes de nueva página
        
        // ✅ Columnas OPTIMIZADAS para 781px disponibles (contentWidth)
        const columnWidths = {
            num: 26,       // #
            dni: 58,       // DNI
            nombre: 118,   // Cliente
            telefono: 68,  // Telefono
            direccion: 148, // Direccion (la más ancha)
            servicio: 64,  // Servicio
            plan: 66,      // Plan
            precio: 52,    // Precio
            deuda: 40,     // Meses
            total: 50,     // Total S/
            estado: 62     // Estado
        };
        
        const totalWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0);
        console.log(`✅ Ancho total tabla: ${totalWidth}px | Disponible: ${this.contentWidth}px`);
        
        let xPos = this.margin;
        
        // ENCABEZADO
        doc.rect(this.margin, y, totalWidth, alturaFila - 2).fill(this.colors.primary);
        
        doc.fontSize(8)
           .font('Helvetica-Bold')
           .fillColor(this.colors.white);
        
        const headerY = y + 8;
        
        doc.text('#', xPos + 2, headerY, { width: columnWidths.num - 4, align: 'center' });
        xPos += columnWidths.num;
        
        doc.text('DNI', xPos + 2, headerY, { width: columnWidths.dni - 4 });
        xPos += columnWidths.dni;
        
        doc.text('CLIENTE', xPos + 2, headerY, { width: columnWidths.nombre - 4 });
        xPos += columnWidths.nombre;
        
        doc.text('TELEFONO', xPos + 2, headerY, { width: columnWidths.telefono - 4 });
        xPos += columnWidths.telefono;
        
        doc.text('DIRECCION', xPos + 2, headerY, { width: columnWidths.direccion - 4 });
        xPos += columnWidths.direccion;
        
        doc.text('SERVICIO', xPos + 2, headerY, { width: columnWidths.servicio - 4 });
        xPos += columnWidths.servicio;
        
        doc.text('PLAN', xPos + 2, headerY, { width: columnWidths.plan - 4 });
        xPos += columnWidths.plan;
        
        doc.text('PRECIO', xPos + 2, headerY, { width: columnWidths.precio - 4, align: 'right' });
        xPos += columnWidths.precio;
        
        doc.text('MESES', xPos + 2, headerY, { width: columnWidths.deuda - 4, align: 'center' });
        xPos += columnWidths.deuda;
        
        doc.text('DEUDA', xPos + 2, headerY, { width: columnWidths.total - 4, align: 'right' });
        xPos += columnWidths.total;
        
        doc.text('ESTADO', xPos + 2, headerY, { width: columnWidths.estado - 4, align: 'center' });
        
        y += alturaFila - 2;
        
        // Línea separadora
        doc.strokeColor('#FFD700')
           .lineWidth(2)
           .moveTo(this.margin, y)
           .lineTo(this.margin + totalWidth, y)
           .stroke();
        
        y += 2;
        
        // DATOS
        doc.font('Helvetica').fontSize(7);
        
        clientes.forEach((cliente, index) => {
            // ✅ VERIFICAR ESPACIO - si no cabe, nueva página
            if (y + alturaFila > maxY) {
                doc.addPage({ 
                    size: 'A4', 
                    layout: 'landscape',
                    margins: {
                        top: this.margin,
                        bottom: this.margin,
                        left: this.margin,
                        right: this.margin
                    }
                });
                y = this.margin + 5;
                
                // Repetir encabezado
                this.agregarEncabezadoTabla(doc, y, columnWidths, alturaFila);
                y += alturaFila;
            }
            
            // Fondo de fila
            let colorFondo = this.colors.white;
            let bordeIzq = this.colors.light;
            
            if (cliente.estado === 'suspendido') {
                colorFondo = '#FDE68A';
                bordeIzq = this.colors.warning;
            } else if (cliente.estado === 'cancelado') {
                colorFondo = '#FCA5A5';
                bordeIzq = this.colors.danger;
            } else if (cliente.meses_deuda === 0) {
                colorFondo = this.colors.bgSuccess;
                bordeIzq = this.colors.success;
            } else if (cliente.meses_deuda >= 3) {
                colorFondo = this.colors.bgDanger;
                bordeIzq = this.colors.danger;
            } else if (cliente.meses_deuda > 0) {
                colorFondo = this.colors.bgWarning;
                bordeIzq = this.colors.warning;
            } else if (index % 2 === 0) {
                colorFondo = this.colors.bgLight;
            }
            
            doc.rect(this.margin, y, totalWidth, alturaFila).fill(colorFondo);
            doc.rect(this.margin, y, 3, alturaFila).fill(bordeIzq);
            
            let colorTexto = this.colors.dark;
            if (cliente.meses_deuda >= 3) {
                colorTexto = this.colors.danger;
            } else if (cliente.meses_deuda > 0) {
                colorTexto = this.colors.warning;
            } else {
                colorTexto = this.colors.success;
            }
            
            const textY = y + 4;
            xPos = this.margin + 3;
            
            // # Numero
            doc.fontSize(8)
               .font('Helvetica-Bold')
               .fillColor(this.colors.primary)
               .text((index + 1).toString(), xPos, textY + 5, {
                   width: columnWidths.num - 6,
                   align: 'center'
               });
            xPos += columnWidths.num;
            
            // DNI
            doc.fontSize(7)
               .font('Helvetica')
               .fillColor(colorTexto)
               .text(cliente.dni || '-', xPos, textY + 5, {
                   width: columnWidths.dni - 4,
                   ellipsis: true
               });
            xPos += columnWidths.dni;
            
            // Nombre - 2 lineas
            const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim();
            doc.fontSize(7)
               .font('Helvetica-Bold')
               .fillColor(this.colors.dark)
               .text(nombreCompleto, xPos, textY + 1, {
                   width: columnWidths.nombre - 4,
                   ellipsis: true,
                   lineBreak: true,
                   height: 18
               });
            xPos += columnWidths.nombre;
            
            // Telefono
            doc.fontSize(7)
               .font('Helvetica')
               .fillColor(this.colors.dark)
               .text(cliente.telefono || '-', xPos, textY + 5, {
                   width: columnWidths.telefono - 4,
                   ellipsis: true
               });
            xPos += columnWidths.telefono;
            
            // Direccion - 2 lineas
            doc.fontSize(6.5)
               .font('Helvetica')
               .fillColor('#4B5563')
               .text(cliente.direccion || '-', xPos, textY + 1, {
                   width: columnWidths.direccion - 4,
                   ellipsis: true,
                   lineBreak: true,
                   height: 20
               });
            xPos += columnWidths.direccion;
            
            // Servicio
            doc.fontSize(7)
               .font('Helvetica-Bold')
               .fillColor(this.colors.primary)
               .text((cliente.tipo_servicio || '-').toUpperCase(), xPos, textY + 5, {
                   width: columnWidths.servicio - 4,
                   ellipsis: true
               });
            xPos += columnWidths.servicio;
            
            // Plan
            doc.fontSize(6.5)
               .font('Helvetica')
               .fillColor(this.colors.dark)
               .text(cliente.plan || '-', xPos, textY + 5, {
                   width: columnWidths.plan - 4,
                   ellipsis: true
               });
            xPos += columnWidths.plan;
            
            // Precio
            doc.fontSize(8)
               .font('Helvetica-Bold')
               .fillColor(this.colors.success)
               .text(`S/ ${parseFloat(cliente.precio_mensual || 0).toFixed(2)}`, xPos, textY + 5, {
                   width: columnWidths.precio - 4,
                   align: 'right'
               });
            xPos += columnWidths.precio;
            
            // Meses deuda con badge
            const mesesDeuda = cliente.meses_deuda || 0;
            let badgeColor = this.colors.success;
            if (mesesDeuda >= 3) badgeColor = this.colors.danger;
            else if (mesesDeuda > 0) badgeColor = this.colors.warning;
            
            doc.circle(xPos + 17, textY + 10, 9)
               .fillOpacity(0.2)
               .fill(badgeColor)
               .fillOpacity(1);
            
            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor(badgeColor)
               .text(mesesDeuda.toString(), xPos, textY + 5, {
                   width: columnWidths.deuda - 4,
                   align: 'center'
               });
            xPos += columnWidths.deuda;
            
            // Deuda total
            const deudaTotal = parseFloat(cliente.precio_mensual || 0) * mesesDeuda;
            doc.fontSize(8)
               .font('Helvetica-Bold')
               .fillColor(deudaTotal > 0 ? this.colors.danger : this.colors.success)
               .text(`S/ ${deudaTotal.toFixed(2)}`, xPos, textY + 5, {
                   width: columnWidths.total - 4,
                   align: 'right'
               });
            xPos += columnWidths.total;
            
            // Estado con badge
            let estadoTexto = 'AL DIA';
            let estadoColor = this.colors.success;
            let estadoBg = this.colors.bgSuccess;
            
            if (cliente.estado === 'suspendido') {
                estadoTexto = 'SUSP';
                estadoColor = this.colors.warning;
                estadoBg = this.colors.bgWarning;
            } else if (cliente.estado === 'cancelado') {
                estadoTexto = 'CANCEL';
                estadoColor = this.colors.danger;
                estadoBg = this.colors.bgDanger;
            } else if (mesesDeuda >= 3) {
                estadoTexto = 'MOROSO';
                estadoColor = this.colors.danger;
                estadoBg = this.colors.bgDanger;
            } else if (mesesDeuda > 0) {
                estadoTexto = 'DEUDOR';
                estadoColor = this.colors.warning;
                estadoBg = this.colors.bgWarning;
            }
            
            doc.roundedRect(xPos + 4, textY + 3, columnWidths.estado - 8, 16, 8)
               .fill(estadoBg);
            
            doc.fontSize(7)
               .font('Helvetica-Bold')
               .fillColor(estadoColor)
               .text(estadoTexto, xPos + 4, textY + 7, {
                   width: columnWidths.estado - 8,
                   align: 'center'
               });
            
            // Línea separadora
            doc.strokeColor('#E5E7EB')
               .lineWidth(0.5)
               .moveTo(this.margin + 3, y + alturaFila)
               .lineTo(this.margin + totalWidth - 3, y + alturaFila)
               .stroke();
            
            y += alturaFila;
        });
        
        return y;
    }

    agregarEncabezadoTabla(doc, y, columnWidths, alturaFila) {
        const totalWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0);
        let xPos = this.margin;
        
        doc.rect(this.margin, y, totalWidth, alturaFila - 2).fill(this.colors.primary);
        
        doc.fontSize(8)
           .font('Helvetica-Bold')
           .fillColor(this.colors.white);
        
        const headerY = y + 8;
        
        doc.text('#', xPos + 2, headerY, { width: columnWidths.num - 4, align: 'center' });
        xPos += columnWidths.num;
        doc.text('DNI', xPos + 2, headerY, { width: columnWidths.dni - 4 });
        xPos += columnWidths.dni;
        doc.text('CLIENTE', xPos + 2, headerY, { width: columnWidths.nombre - 4 });
        xPos += columnWidths.nombre;
        doc.text('TELEFONO', xPos + 2, headerY, { width: columnWidths.telefono - 4 });
        xPos += columnWidths.telefono;
        doc.text('DIRECCION', xPos + 2, headerY, { width: columnWidths.direccion - 4 });
        xPos += columnWidths.direccion;
        doc.text('SERVICIO', xPos + 2, headerY, { width: columnWidths.servicio - 4 });
        xPos += columnWidths.servicio;
        doc.text('PLAN', xPos + 2, headerY, { width: columnWidths.plan - 4 });
        xPos += columnWidths.plan;
        doc.text('PRECIO', xPos + 2, headerY, { width: columnWidths.precio - 4, align: 'right' });
        xPos += columnWidths.precio;
        doc.text('MESES', xPos + 2, headerY, { width: columnWidths.deuda - 4, align: 'center' });
        xPos += columnWidths.deuda;
        doc.text('DEUDA', xPos + 2, headerY, { width: columnWidths.total - 4, align: 'right' });
        xPos += columnWidths.total;
        doc.text('ESTADO', xPos + 2, headerY, { width: columnWidths.estado - 4, align: 'center' });
        
        doc.strokeColor('#FFD700')
           .lineWidth(2)
           .moveTo(this.margin, y + alturaFila - 2)
           .lineTo(this.margin + totalWidth, y + alturaFila - 2)
           .stroke();
    }

    agregarResumen(doc, estadisticas, y) {
        const maxY = this.pageHeight - this.margin - 150;
        
        if (y > maxY) {
            doc.addPage({ 
                size: 'A4', 
                layout: 'landscape',
                margins: {
                    top: this.margin,
                    bottom: this.margin,
                    left: this.margin,
                    right: this.margin
                }
            });
            y = this.margin + 10;
        } else {
            y += 20;
        }
        
        // Título - respeta ancho total
        doc.rect(this.margin, y, this.contentWidth, 35)
           .fill(this.colors.primary);
        
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor(this.colors.white)
           .text('RESUMEN EJECUTIVO', this.margin + 10, y + 10);
        
        y += 45;
        
        // Tarjetas
        const cardWidth = 148;
        const cardHeight = 70;
        const gap = 7;
        
        const metricas = [
            {
                titulo: 'TOTAL CLIENTES',
                valor: estadisticas.total,
                color: this.colors.info,
                bgColor: this.colors.bgInfo
            },
            {
                titulo: 'AL DIA',
                valor: estadisticas.pagados,
                subtitulo: `${((estadisticas.pagados / estadisticas.total) * 100).toFixed(1)}%`,
                color: this.colors.success,
                bgColor: this.colors.bgSuccess
            },
            {
                titulo: 'DEUDORES',
                valor: estadisticas.deudores,
                subtitulo: `${((estadisticas.deudores / estadisticas.total) * 100).toFixed(1)}%`,
                color: this.colors.warning,
                bgColor: this.colors.bgWarning
            },
            {
                titulo: 'MOROSOS',
                valor: estadisticas.morosos,
                subtitulo: `${((estadisticas.morosos / estadisticas.total) * 100).toFixed(1)}%`,
                color: this.colors.danger,
                bgColor: this.colors.bgDanger
            },
            {
                titulo: 'INGRESO MENSUAL',
                valor: `S/ ${estadisticas.ingresos.toFixed(2)}`,
                subtitulo: 'Activos',
                color: this.colors.success,
                bgColor: this.colors.bgSuccess
            }
        ];
        
        metricas.forEach((metrica, index) => {
            const xPos = this.margin + (index * (cardWidth + gap));
            const yPos = y;
            
            // Sombra
            doc.rect(xPos + 2, yPos + 2, cardWidth, cardHeight)
               .fillOpacity(0.1)
               .fill('#000000')
               .fillOpacity(1);
            
            // Tarjeta
            doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 6)
               .fill(metrica.bgColor);
            
            // Borde
            doc.roundedRect(xPos, yPos, 5, cardHeight, 3)
               .fill(metrica.color);
            
            // Título
            doc.fontSize(7)
               .font('Helvetica')
               .fillColor(this.colors.dark)
               .fillOpacity(0.7)
               .text(metrica.titulo, xPos + 10, yPos + 12, {
                   width: cardWidth - 15
               })
               .fillOpacity(1);
            
            // Valor
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .fillColor(metrica.color)
               .text(metrica.valor.toString(), xPos + 10, yPos + 28, {
                   width: cardWidth - 15,
                   align: 'center'
               });
            
            // Subtítulo
            if (metrica.subtitulo) {
                doc.fontSize(7)
                   .font('Helvetica')
                   .fillColor(this.colors.dark)
                   .fillOpacity(0.6)
                   .text(metrica.subtitulo, xPos + 10, yPos + 52, {
                       width: cardWidth - 15,
                       align: 'center'
                   })
                   .fillOpacity(1);
            }
        });
        
        y += cardHeight + 15;
        
        // Análisis - respeta ancho
        doc.rect(this.margin, y, this.contentWidth, 45)
           .fillOpacity(0.05)
           .fill(this.colors.primary)
           .fillOpacity(1);
        
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(this.colors.primary)
           .text('ANALISIS FINANCIERO', this.margin + 10, y + 8);
        
        const tasaCobranza = ((estadisticas.pagados / estadisticas.total) * 100).toFixed(1);
        const deudaTotal = (estadisticas.morosos * 150).toFixed(2);
        const promedio = (estadisticas.ingresos / estadisticas.total).toFixed(2);
        
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor(this.colors.dark)
           .text(`Tasa de Cobranza: ${tasaCobranza}% | Deuda Total Estimada: S/ ${deudaTotal} | Promedio por Cliente: S/ ${promedio}`, this.margin + 10, y + 25, {
               width: this.contentWidth - 20
           });
        
        return y + 60;
    }

    agregarPiePagina(doc) {
        const pageCount = doc.bufferedPageRange().count;
        const pieY = this.pageHeight - 20;
        
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            
            doc.strokeColor(this.colors.light)
               .lineWidth(1)
               .moveTo(this.margin, pieY - 5)
               .lineTo(this.pageWidth - this.margin, pieY - 5)
               .stroke();
            
            doc.fontSize(7)
               .font('Helvetica')
               .fillColor(this.colors.dark)
               .fillOpacity(0.6)
               .text('TV JHAIRE - Sistema de Gestion Integral', this.margin, pieY, { 
                   width: this.contentWidth / 2 
               })
               .text(`Pagina ${i + 1} de ${pageCount}`, this.pageWidth / 2, pieY, { 
                   width: this.contentWidth / 2, 
                   align: 'right' 
               })
               .fillOpacity(1);
        }
    }

    async generarReporteGeneral(clientes) {
        const doc = this.crearDocumento();
        this.agregarEncabezado(doc, 'Reporte General de Clientes');

        const estadisticas = {
            total: clientes.length,
            pagados: clientes.filter(c => c.meses_deuda === 0).length,
            deudores: clientes.filter(c => c.meses_deuda > 0 && c.meses_deuda < 3).length,
            morosos: clientes.filter(c => c.meses_deuda >= 3).length,
            ingresos: clientes.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0)
        };

        let y = this.agregarTablaClientes(doc, clientes);
        this.agregarResumen(doc, estadisticas, y);
        this.agregarPiePagina(doc);

        return doc;
    }

    async generarReporteDeudores(clientes) {
        const deudores = clientes.filter(c => c.meses_deuda > 0);
        
        const doc = this.crearDocumento();
        this.agregarEncabezado(doc, 'Reporte de Clientes Deudores y Morosos');

        const estadisticas = {
            total: deudores.length,
            pagados: 0,
            deudores: deudores.filter(c => c.meses_deuda < 3).length,
            morosos: deudores.filter(c => c.meses_deuda >= 3).length,
            ingresos: deudores.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0)
        };

        let y = this.agregarTablaClientes(doc, deudores);
        this.agregarResumen(doc, estadisticas, y);
        this.agregarPiePagina(doc);

        return doc;
    }

    async generarReportePorServicio(clientes, tipoServicio) {
        const tipoNormalizado = tipoServicio.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
        const filtrados = clientes.filter(c => {
            if (!c.tipo_servicio) return false;
            return c.tipo_servicio.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() === tipoNormalizado;
        });
        
        const doc = this.crearDocumento();
        this.agregarEncabezado(doc, `Reporte - ${tipoServicio.toUpperCase()}`);

        const estadisticas = {
            total: filtrados.length,
            pagados: filtrados.filter(c => c.meses_deuda === 0).length,
            deudores: filtrados.filter(c => c.meses_deuda > 0 && c.meses_deuda < 3).length,
            morosos: filtrados.filter(c => c.meses_deuda >= 3).length,
            ingresos: filtrados.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0)
        };

        let y = this.agregarTablaClientes(doc, filtrados);
        this.agregarResumen(doc, estadisticas, y);
        this.agregarPiePagina(doc);

        return doc;
    }

    async generarReportePorSenal(clientes, tipoSenal) {
        const senalNormalizada = tipoSenal.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
        const filtrados = clientes.filter(c => {
            if (!c.tipo_senal) return false;
            return c.tipo_senal.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() === senalNormalizada;
        });
        
        const doc = this.crearDocumento();
        this.agregarEncabezado(doc, `Reporte - Senal ${tipoSenal.toUpperCase()}`);

        const estadisticas = {
            total: filtrados.length,
            pagados: filtrados.filter(c => c.meses_deuda === 0).length,
            deudores: filtrados.filter(c => c.meses_deuda > 0 && c.meses_deuda < 3).length,
            morosos: filtrados.filter(c => c.meses_deuda >= 3).length,
            ingresos: filtrados.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0)
        };

        let y = this.agregarTablaClientes(doc, filtrados);
        this.agregarResumen(doc, estadisticas, y);
        this.agregarPiePagina(doc);

        return doc;
    }
}

module.exports = new PDFService();
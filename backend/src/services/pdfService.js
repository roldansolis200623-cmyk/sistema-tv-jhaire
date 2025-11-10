const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
    constructor() {
        this.logoPath = path.join(__dirname, '../assets/logo.png');
        
        // 🎨 PALETA DE COLORES ULTRA MODERNA
        this.colors = {
            primary: '#6366F1',      // Indigo vibrante
            secondary: '#8B5CF6',    // Púrpura
            success: '#10B981',      // Verde esmeralda
            warning: '#F59E0B',      // Ámbar
            danger: '#EF4444',       // Rojo coral
            info: '#3B82F6',         // Azul cielo
            dark: '#1F2937',         // Gris oscuro
            light: '#F3F4F6',        // Gris claro
            white: '#FFFFFF',
            
            // Gradientes
            gradient1: '#6366F1',
            gradient2: '#8B5CF6',
            
            // Estados
            alDia: '#10B981',
            deudor: '#F59E0B',
            moroso: '#EF4444',
            suspendido: '#6B7280',
            
            // Fondos
            bgSuccess: '#D1FAE5',
            bgWarning: '#FEF3C7',
            bgDanger: '#FEE2E2',
            bgInfo: '#DBEAFE',
            bgLight: '#F9FAFB'
        };
    }

    // ✅ Documento HORIZONTAL con configuración premium
    crearDocumento() {
        return new PDFDocument({
            size: 'A4',
            layout: 'landscape',
            margins: {
                top: 30,
                bottom: 30,
                left: 30,
                right: 30
            },
            bufferPages: true,
            autoFirstPage: true
        });
    }

    // 🎨 ENCABEZADO ULTRA PREMIUM CON DEGRADADO
    agregarEncabezado(doc, titulo) {
        const pageWidth = 812; // A4 landscape total width
        const contentWidth = pageWidth - 60; // Menos márgenes
        
        // ═══════════════════════════════════════════
        // FONDO DEGRADADO SUPERIOR
        // ═══════════════════════════════════════════
        doc.rect(0, 0, pageWidth, 100).fill(this.colors.primary);
        
        // Segundo nivel de degradado (efecto moderno)
        doc.rect(0, 70, pageWidth, 30)
           .fillOpacity(0.3)
           .fill(this.colors.gradient2)
           .fillOpacity(1);
        
        // ═══════════════════════════════════════════
        // LOGO EMPRESARIAL
        // ═══════════════════════════════════════════
        if (fs.existsSync(this.logoPath)) {
            try {
                // Logo con sombra
                doc.image(this.logoPath, 40, 25, { width: 90, height: 50 });
            } catch (error) {
                // Logo alternativo con texto
                doc.fontSize(24)
                   .font('Helvetica-Bold')
                   .fillColor(this.colors.white)
                   .text('TV JHAIRE', 40, 35);
            }
        }
        
        // ═══════════════════════════════════════════
        // TÍTULO PRINCIPAL CON SOMBRA
        // ═══════════════════════════════════════════
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .fillColor(this.colors.white)
           .text(titulo.toUpperCase(), 150, 30, {
               width: contentWidth - 200,
               align: 'left'
           });
        
        // ═══════════════════════════════════════════
        // INFORMACIÓN DE EMPRESA
        // ═══════════════════════════════════════════
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor(this.colors.white)
           .fillOpacity(0.9)
           .text('TELECOMUNICACIONES JHAIR EIRL', 150, 52)
           .text('RUC: 20606847291 | Trujillo, La Libertad, Perú', 150, 62)
           .fillOpacity(1);
        
        // ═══════════════════════════════════════════
        // FECHA Y HORA EN BADGE MODERNO
        // ═══════════════════════════════════════════
        const ahora = new Date();
        const fechaTexto = ahora.toLocaleDateString('es-PE', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        const horaTexto = ahora.toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        // Badge para fecha
        const badgeX = contentWidth - 150;
        doc.roundedRect(badgeX, 30, 140, 45, 5)
           .fillOpacity(0.2)
           .fill(this.colors.white)
           .fillOpacity(1);
        
        doc.fontSize(7)
           .font('Helvetica')
           .fillColor(this.colors.white)
           .fillOpacity(0.8)
           .text('📅 GENERADO', badgeX + 10, 35, { width: 120 })
           .fillOpacity(1);
        
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor(this.colors.white)
           .text(fechaTexto.toUpperCase(), badgeX + 10, 47, { 
               width: 120,
               align: 'left'
           })
           .text(`🕐 ${horaTexto}`, badgeX + 10, 60, {
               width: 120,
               align: 'left'
           });
        
        return doc;
    }

    // 🎯 TABLA ULTRA DETALLADA CON TODA LA INFORMACIÓN
    agregarTablaClientes(doc, clientes, y = 110) {
        const alturaFila = 32; // MÁS ALTO para más información
        const pageWidth = 812;
        
        // ═══════════════════════════════════════════
        // COLUMNAS OPTIMIZADAS PARA MÁXIMA INFO
        // ═══════════════════════════════════════════
        const columnWidths = {
            num: 30,          // # 
            dni: 65,          // DNI
            nombre: 140,      // Nombre completo
            telefono: 80,     // Teléfono
            direccion: 180,   // Dirección COMPLETA
            servicio: 75,     // Tipo servicio
            plan: 80,         // Plan/Perfil
            precio: 60,       // Precio
            deuda: 45,        // Meses deuda
            total: 60,        // Deuda total S/
            estado: 70        // Estado
        };
        
        const totalWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0);
        let xPos = 30;
        
        // ═══════════════════════════════════════════
        // ENCABEZADO DE TABLA - ULTRA PROFESIONAL
        // ═══════════════════════════════════════════
        
        // Fondo con degradado
        doc.rect(30, y, totalWidth, alturaFila)
           .fill(this.colors.primary);
        
        doc.rect(30, y, totalWidth, alturaFila)
           .fillOpacity(0.3)
           .fill(this.colors.gradient2)
           .fillOpacity(1);
        
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor(this.colors.white);
        
        const headerY = y + 10;
        
        // Encabezados con iconos
        doc.text('#', xPos + 5, headerY, { width: columnWidths.num - 10, align: 'center' });
        xPos += columnWidths.num;
        
        doc.text('📋 DNI', xPos + 5, headerY, { width: columnWidths.dni - 10 });
        xPos += columnWidths.dni;
        
        doc.text('👤 CLIENTE', xPos + 5, headerY, { width: columnWidths.nombre - 10 });
        xPos += columnWidths.nombre;
        
        doc.text('📞 TELÉFONO', xPos + 5, headerY, { width: columnWidths.telefono - 10 });
        xPos += columnWidths.telefono;
        
        doc.text('📍 DIRECCIÓN', xPos + 5, headerY, { width: columnWidths.direccion - 10 });
        xPos += columnWidths.direccion;
        
        doc.text('📡 SERVICIO', xPos + 5, headerY, { width: columnWidths.servicio - 10 });
        xPos += columnWidths.servicio;
        
        doc.text('📊 PLAN', xPos + 5, headerY, { width: columnWidths.plan - 10 });
        xPos += columnWidths.plan;
        
        doc.text('💰 PRECIO', xPos + 5, headerY, { width: columnWidths.precio - 10, align: 'right' });
        xPos += columnWidths.precio;
        
        doc.text('⏱️ MESES', xPos + 5, headerY, { width: columnWidths.deuda - 10, align: 'center' });
        xPos += columnWidths.deuda;
        
        doc.text('💸 DEUDA', xPos + 5, headerY, { width: columnWidths.total - 10, align: 'right' });
        xPos += columnWidths.total;
        
        doc.text('🎯 ESTADO', xPos + 5, headerY, { width: columnWidths.estado - 10, align: 'center' });
        
        y += alturaFila;
        
        // ═══════════════════════════════════════════
        // LÍNEA SEPARADORA DORADA
        // ═══════════════════════════════════════════
        doc.strokeColor('#FFD700')
           .lineWidth(2)
           .moveTo(30, y)
           .lineTo(30 + totalWidth, y)
           .stroke();
        
        y += 3;
        
        // ═══════════════════════════════════════════
        // FILAS DE DATOS - ULTRA DETALLADAS
        // ═══════════════════════════════════════════
        doc.font('Helvetica').fontSize(8);
        
        clientes.forEach((cliente, index) => {
            // Verificar nueva página
            if (y > 520) {
                doc.addPage({ layout: 'landscape' });
                y = 30;
                
                // Repetir encabezado
                this.agregarEncabezadoTabla(doc, y, columnWidths, alturaFila);
                y += alturaFila + 3;
            }
            
            // ═══════════════════════════════════════════
            // FONDO DE FILA CON COLORES INTELIGENTES
            // ═══════════════════════════════════════════
            let colorFondo = this.colors.white;
            let bordeIzq = this.colors.light;
            
            if (cliente.estado === 'suspendido') {
                colorFondo = '#FDE68A'; // Amarillo fuerte
                bordeIzq = this.colors.warning;
            } else if (cliente.estado === 'cancelado') {
                colorFondo = '#FCA5A5'; // Rojo fuerte
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
            
            // Rectángulo con borde lateral colorido
            doc.rect(30, y, totalWidth, alturaFila).fill(colorFondo);
            doc.rect(30, y, 4, alturaFila).fill(bordeIzq);
            
            // ═══════════════════════════════════════════
            // COLOR DE TEXTO SEGÚN CRITICIDAD
            // ═══════════════════════════════════════════
            let colorTexto = this.colors.dark;
            if (cliente.meses_deuda >= 3) {
                colorTexto = this.colors.danger;
            } else if (cliente.meses_deuda > 0) {
                colorTexto = this.colors.warning;
            } else {
                colorTexto = this.colors.success;
            }
            
            const textY = y + 6;
            xPos = 34; // +4 por el borde lateral
            
            // ═══════════════════════════════════════════
            // # NÚMERO CORRELATIVO
            // ═══════════════════════════════════════════
            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor(this.colors.primary)
               .text((index + 1).toString(), xPos + 5, textY + 5, {
                   width: columnWidths.num - 10,
                   align: 'center'
               });
            xPos += columnWidths.num;
            
            // ═══════════════════════════════════════════
            // DNI
            // ═══════════════════════════════════════════
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor(colorTexto)
               .text(cliente.dni || '-', xPos + 5, textY + 5, {
                   width: columnWidths.dni - 10
               });
            xPos += columnWidths.dni;
            
            // ═══════════════════════════════════════════
            // NOMBRE COMPLETO - 2 LÍNEAS
            // ═══════════════════════════════════════════
            const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim();
            doc.fontSize(8)
               .font('Helvetica-Bold')
               .fillColor(this.colors.dark)
               .text(nombreCompleto, xPos + 5, textY + 2, {
                   width: columnWidths.nombre - 10,
                   ellipsis: true,
                   lineBreak: true,
                   height: 20
               });
            xPos += columnWidths.nombre;
            
            // ═══════════════════════════════════════════
            // TELÉFONO CON ICONO
            // ═══════════════════════════════════════════
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor(this.colors.dark)
               .text(cliente.telefono || 'Sin teléfono', xPos + 5, textY + 5, {
                   width: columnWidths.telefono - 10
               });
            xPos += columnWidths.telefono;
            
            // ═══════════════════════════════════════════
            // DIRECCIÓN COMPLETA - 2 LÍNEAS
            // ═══════════════════════════════════════════
            doc.fontSize(7)
               .font('Helvetica')
               .fillColor('#4B5563')
               .text(cliente.direccion || 'Sin dirección', xPos + 5, textY + 2, {
                   width: columnWidths.direccion - 10,
                   ellipsis: true,
                   lineBreak: true,
                   height: 22
               });
            xPos += columnWidths.direccion;
            
            // ═══════════════════════════════════════════
            // TIPO DE SERVICIO CON BADGE
            // ═══════════════════════════════════════════
            doc.fontSize(7)
               .font('Helvetica-Bold')
               .fillColor(this.colors.primary)
               .text((cliente.tipo_servicio || '-').toUpperCase(), xPos + 5, textY + 5, {
                   width: columnWidths.servicio - 10
               });
            xPos += columnWidths.servicio;
            
            // ═══════════════════════════════════════════
            // PLAN/PERFIL
            // ═══════════════════════════════════════════
            doc.fontSize(7)
               .font('Helvetica')
               .fillColor(this.colors.dark)
               .text(cliente.plan || cliente.perfil_internet || '-', xPos + 5, textY + 5, {
                   width: columnWidths.plan - 10,
                   ellipsis: true
               });
            xPos += columnWidths.plan;
            
            // ═══════════════════════════════════════════
            // PRECIO MENSUAL
            // ═══════════════════════════════════════════
            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor(this.colors.success)
               .text(`S/ ${parseFloat(cliente.precio_mensual || 0).toFixed(2)}`, xPos + 5, textY + 5, {
                   width: columnWidths.precio - 10,
                   align: 'right'
               });
            xPos += columnWidths.precio;
            
            // ═══════════════════════════════════════════
            // MESES DE DEUDA CON BADGE
            // ═══════════════════════════════════════════
            const mesesDeuda = cliente.meses_deuda || 0;
            let badgeColor = this.colors.success;
            if (mesesDeuda >= 3) badgeColor = this.colors.danger;
            else if (mesesDeuda > 0) badgeColor = this.colors.warning;
            
            // Badge circular
            doc.circle(xPos + 20, textY + 10, 12)
               .fillOpacity(0.2)
               .fill(badgeColor)
               .fillOpacity(1);
            
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor(badgeColor)
               .text(mesesDeuda.toString(), xPos + 5, textY + 5, {
                   width: columnWidths.deuda - 10,
                   align: 'center'
               });
            xPos += columnWidths.deuda;
            
            // ═══════════════════════════════════════════
            // DEUDA TOTAL EN SOLES
            // ═══════════════════════════════════════════
            const deudaTotal = parseFloat(cliente.precio_mensual || 0) * mesesDeuda;
            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor(deudaTotal > 0 ? this.colors.danger : this.colors.success)
               .text(`S/ ${deudaTotal.toFixed(2)}`, xPos + 5, textY + 5, {
                   width: columnWidths.total - 10,
                   align: 'right'
               });
            xPos += columnWidths.total;
            
            // ═══════════════════════════════════════════
            // ESTADO CON BADGE PREMIUM
            // ═══════════════════════════════════════════
            let estadoTexto = 'AL DÍA';
            let estadoColor = this.colors.success;
            let estadoBg = this.colors.bgSuccess;
            
            if (cliente.estado === 'suspendido') {
                estadoTexto = 'SUSPENDIDO';
                estadoColor = this.colors.warning;
                estadoBg = this.colors.bgWarning;
            } else if (cliente.estado === 'cancelado') {
                estadoTexto = 'CANCELADO';
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
            
            // Badge redondeado
            doc.roundedRect(xPos + 8, textY + 3, columnWidths.estado - 16, 18, 9)
               .fill(estadoBg);
            
            doc.fontSize(7)
               .font('Helvetica-Bold')
               .fillColor(estadoColor)
               .text(estadoTexto, xPos + 8, textY + 8, {
                   width: columnWidths.estado - 16,
                   align: 'center'
               });
            
            // ═══════════════════════════════════════════
            // LÍNEA SEPARADORA SUTIL
            // ═══════════════════════════════════════════
            doc.strokeColor('#E5E7EB')
               .lineWidth(0.5)
               .moveTo(34, y + alturaFila)
               .lineTo(34 + totalWidth - 4, y + alturaFila)
               .stroke();
            
            y += alturaFila;
        });
        
        return y;
    }

    // 🎨 Helper para repetir encabezados
    agregarEncabezadoTabla(doc, y, columnWidths, alturaFila) {
        const totalWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0);
        let xPos = 30;
        
        doc.rect(30, y, totalWidth, alturaFila).fill(this.colors.primary);
        doc.rect(30, y, totalWidth, alturaFila)
           .fillOpacity(0.3)
           .fill(this.colors.gradient2)
           .fillOpacity(1);
        
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor(this.colors.white);
        
        const headerY = y + 10;
        
        doc.text('#', xPos + 5, headerY, { width: columnWidths.num - 10, align: 'center' });
        xPos += columnWidths.num;
        doc.text('📋 DNI', xPos + 5, headerY, { width: columnWidths.dni - 10 });
        xPos += columnWidths.dni;
        doc.text('👤 CLIENTE', xPos + 5, headerY, { width: columnWidths.nombre - 10 });
        xPos += columnWidths.nombre;
        doc.text('📞 TELÉFONO', xPos + 5, headerY, { width: columnWidths.telefono - 10 });
        xPos += columnWidths.telefono;
        doc.text('📍 DIRECCIÓN', xPos + 5, headerY, { width: columnWidths.direccion - 10 });
        xPos += columnWidths.direccion;
        doc.text('📡 SERVICIO', xPos + 5, headerY, { width: columnWidths.servicio - 10 });
        xPos += columnWidths.servicio;
        doc.text('📊 PLAN', xPos + 5, headerY, { width: columnWidths.plan - 10 });
        xPos += columnWidths.plan;
        doc.text('💰 PRECIO', xPos + 5, headerY, { width: columnWidths.precio - 10, align: 'right' });
        xPos += columnWidths.precio;
        doc.text('⏱️ MESES', xPos + 5, headerY, { width: columnWidths.deuda - 10, align: 'center' });
        xPos += columnWidths.deuda;
        doc.text('💸 DEUDA', xPos + 5, headerY, { width: columnWidths.total - 10, align: 'right' });
        xPos += columnWidths.total;
        doc.text('🎯 ESTADO', xPos + 5, headerY, { width: columnWidths.estado - 10, align: 'center' });
        
        doc.strokeColor('#FFD700')
           .lineWidth(2)
           .moveTo(30, y + alturaFila)
           .lineTo(30 + totalWidth, y + alturaFila)
           .stroke();
    }

    // 📊 RESUMEN EJECUTIVO ULTRA PREMIUM
    agregarResumen(doc, estadisticas, y) {
        y += 25;
        
        if (y > 450) {
            doc.addPage({ layout: 'landscape' });
            y = 30;
        }
        
        // ═══════════════════════════════════════════
        // TÍTULO DE RESUMEN CON FONDO
        // ═══════════════════════════════════════════
        doc.rect(30, y, 752, 40)
           .fill(this.colors.primary);
        
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor(this.colors.white)
           .text('📊 RESUMEN EJECUTIVO', 45, y + 12);
        
        y += 50;
        
        // ═══════════════════════════════════════════
        // TARJETAS DE MÉTRICAS - ESTILO DASHBOARD
        // ═══════════════════════════════════════════
        const cardWidth = 145;
        const cardHeight = 80;
        const gap = 10;
        
        const metricas = [
            {
                icono: '👥',
                titulo: 'TOTAL CLIENTES',
                valor: estadisticas.total,
                color: this.colors.info,
                bgColor: this.colors.bgInfo
            },
            {
                icono: '✅',
                titulo: 'CLIENTES AL DÍA',
                valor: estadisticas.pagados,
                subtitulo: `${((estadisticas.pagados / estadisticas.total) * 100).toFixed(1)}%`,
                color: this.colors.success,
                bgColor: this.colors.bgSuccess
            },
            {
                icono: '⚠️',
                titulo: 'DEUDORES (1-2 MESES)',
                valor: estadisticas.deudores,
                subtitulo: `${((estadisticas.deudores / estadisticas.total) * 100).toFixed(1)}%`,
                color: this.colors.warning,
                bgColor: this.colors.bgWarning
            },
            {
                icono: '🚨',
                titulo: 'MOROSOS (3+ MESES)',
                valor: estadisticas.morosos,
                subtitulo: `${((estadisticas.morosos / estadisticas.total) * 100).toFixed(1)}%`,
                color: this.colors.danger,
                bgColor: this.colors.bgDanger
            },
            {
                icono: '💰',
                titulo: 'INGRESO MENSUAL',
                valor: `S/ ${estadisticas.ingresos.toFixed(2)}`,
                subtitulo: 'Clientes activos',
                color: this.colors.success,
                bgColor: this.colors.bgSuccess
            }
        ];
        
        metricas.forEach((metrica, index) => {
            const xPos = 30 + (index * (cardWidth + gap));
            const yPos = y;
            
            // Sombra de tarjeta
            doc.rect(xPos + 2, yPos + 2, cardWidth, cardHeight)
               .fillOpacity(0.1)
               .fill('#000000')
               .fillOpacity(1);
            
            // Tarjeta principal
            doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 8)
               .fill(metrica.bgColor);
            
            // Borde lateral colorido
            doc.roundedRect(xPos, yPos, 6, cardHeight, 3)
               .fill(metrica.color);
            
            // Icono grande
            doc.fontSize(24)
               .text(metrica.icono, xPos + 15, yPos + 12);
            
            // Título
            doc.fontSize(7)
               .font('Helvetica')
               .fillColor(this.colors.dark)
               .fillOpacity(0.7)
               .text(metrica.titulo, xPos + 45, yPos + 15, {
                   width: cardWidth - 50
               })
               .fillOpacity(1);
            
            // Valor principal
            doc.fontSize(18)
               .font('Helvetica-Bold')
               .fillColor(metrica.color)
               .text(metrica.valor.toString(), xPos + 15, yPos + 35, {
                   width: cardWidth - 20,
                   align: 'center'
               });
            
            // Subtítulo si existe
            if (metrica.subtitulo) {
                doc.fontSize(8)
                   .font('Helvetica')
                   .fillColor(this.colors.dark)
                   .fillOpacity(0.6)
                   .text(metrica.subtitulo, xPos + 15, yPos + 60, {
                       width: cardWidth - 20,
                       align: 'center'
                   })
                   .fillOpacity(1);
            }
        });
        
        y += cardHeight + 20;
        
        // ═══════════════════════════════════════════
        // ANÁLISIS ADICIONAL
        // ═══════════════════════════════════════════
        const deudaTotal = estadisticas.morosos * 150; // Estimado
        const tasaCobranza = ((estadisticas.pagados / estadisticas.total) * 100).toFixed(1);
        
        doc.rect(30, y, 752, 60)
           .fillOpacity(0.05)
           .fill(this.colors.primary)
           .fillOpacity(1);
        
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor(this.colors.primary)
           .text('💡 ANÁLISIS FINANCIERO', 45, y + 10);
        
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(this.colors.dark)
           .text(`• Tasa de Cobranza: ${tasaCobranza}% | • Deuda Total Estimada: S/ ${deudaTotal.toFixed(2)} | • Promedio por Cliente: S/ ${(estadisticas.ingresos / estadisticas.total).toFixed(2)}`, 45, y + 30, {
               width: 700,
               lineGap: 3
           });
        
        return y + 80;
    }

    // 📄 PIE DE PÁGINA PROFESIONAL
    agregarPiePagina(doc) {
        const pageCount = doc.bufferedPageRange().count;
        
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            
            // Línea superior
            doc.strokeColor(this.colors.light)
               .lineWidth(1)
               .moveTo(30, 565)
               .lineTo(782, 565)
               .stroke();
            
            // Información del pie
            doc.fontSize(7)
               .font('Helvetica')
               .fillColor(this.colors.dark)
               .fillOpacity(0.6)
               .text('TV JHAIRE - Sistema de Gestión Integral', 30, 570, { width: 300 })
               .text(`Página ${i + 1} de ${pageCount}`, 500, 570, { width: 282, align: 'right' })
               .fillOpacity(1);
        }
    }

    // Generar reporte general
    async generarReporteGeneral(clientes) {
        const doc = this.crearDocumento();
        
        this.agregarEncabezado(doc, '📋 Reporte General de Clientes');

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

    // Generar reporte de deudores
    async generarReporteDeudores(clientes) {
        const deudores = clientes.filter(c => c.meses_deuda > 0);
        
        const doc = this.crearDocumento();
        this.agregarEncabezado(doc, '🚨 Reporte de Clientes Deudores y Morosos');

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
        this.agregarEncabezado(doc, `📡 Reporte - ${tipoServicio.toUpperCase()}`);

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
        this.agregarEncabezado(doc, `📶 Reporte - Señal ${tipoSenal.toUpperCase()}`);

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
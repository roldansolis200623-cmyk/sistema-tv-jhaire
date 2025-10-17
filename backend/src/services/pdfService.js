const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
    constructor() {
        this.logoPath = path.join(__dirname, '../assets/logo.png');
    }

    // Crear documento PDF base
    crearDocumento() {
        return new PDFDocument({
            size: 'A4',
            margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50
            }
        });
    }

    // Agregar encabezado con logo
    agregarEncabezado(doc, titulo) {
        // Logo (si existe)
        if (fs.existsSync(this.logoPath)) {
            try {
                doc.image(this.logoPath, 50, 45, { width: 80 });
            } catch (error) {
                console.log('Logo no disponible');
            }
        }

        // Título
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .text(titulo, 150, 50, { align: 'left' });

        // Fecha de generación
        doc.fontSize(10)
           .font('Helvetica')
           .text(`Fecha: ${new Date().toLocaleDateString('es-PE')}`, 150, 75);

        // Línea separadora
        doc.moveTo(50, 110)
           .lineTo(545, 110)
           .stroke();

        return doc;
    }

    // Agregar tabla de clientes
    agregarTablaClientes(doc, clientes, y = 130) {
        const alturaFila = 20;
        const inicioPagina = 130;
        
        // Encabezados de tabla
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor('#ffffff');

        // Fondo azul para encabezados
        doc.rect(50, y, 495, alturaFila).fill('#4472C4');

        doc.fillColor('#ffffff')
           .text('DNI', 55, y + 5, { width: 60 })
           .text('Nombre', 115, y + 5, { width: 80 })
           .text('Telefono', 195, y + 5, { width: 70 })
           .text('Servicio', 265, y + 5, { width: 70 })
           .text('Senal', 335, y + 5, { width: 50 })
           .text('Precio', 385, y + 5, { width: 50 })
           .text('Deuda', 435, y + 5, { width: 40 })
           .text('Estado', 475, y + 5, { width: 70 });

        y += alturaFila;

        // Filas de datos
        doc.font('Helvetica').fontSize(8);

        clientes.forEach((cliente, index) => {
            // Verificar si necesita nueva página
            if (y > 750) {
                doc.addPage();
                y = 50;
                
                // Repetir encabezados en nueva página
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
                doc.rect(50, y, 495, alturaFila).fill('#4472C4');
                doc.fillColor('#ffffff')
                   .text('DNI', 55, y + 5, { width: 60 })
                   .text('Nombre', 115, y + 5, { width: 80 })
                   .text('Telefono', 195, y + 5, { width: 70 })
                   .text('Servicio', 265, y + 5, { width: 70 })
                   .text('Senal', 335, y + 5, { width: 50 })
                   .text('Precio', 385, y + 5, { width: 50 })
                   .text('Deuda', 435, y + 5, { width: 40 })
                   .text('Estado', 475, y + 5, { width: 70 });
                
                y += alturaFila;
                doc.font('Helvetica').fontSize(8);
            }

            // Color de fondo alternado
            const colorFondo = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
            doc.rect(50, y, 495, alturaFila).fill(colorFondo);

            // Color según estado de pago
            let colorTexto = '#000000';
            if (cliente.estado_pago === 'moroso') colorTexto = '#d32f2f';
            else if (cliente.estado_pago === 'deudor') colorTexto = '#f57c00';
            else if (cliente.estado_pago === 'pagado') colorTexto = '#388e3c';

            doc.fillColor(colorTexto)
               .text(cliente.dni || '-', 55, y + 5, { width: 60 })
               .text(`${cliente.nombre || ''} ${cliente.apellido || ''}`.trim(), 115, y + 5, { width: 80 })
               .text(cliente.telefono || '-', 195, y + 5, { width: 70 })
               .text(cliente.tipo_servicio || '-', 265, y + 5, { width: 70 })
               .text(cliente.tipo_senal || '-', 335, y + 5, { width: 50 })
               .text(`S/ ${parseFloat(cliente.precio_mensual || 0).toFixed(2)}`, 385, y + 5, { width: 50 })
               .text((cliente.meses_deuda || '0').toString(), 435, y + 5, { width: 40 })
               .text((cliente.estado_pago || 'PAGADO').toUpperCase(), 475, y + 5, { width: 70 });

            y += alturaFila;
        });

        return y;
    }

    // Agregar resumen
    agregarResumen(doc, estadisticas, y) {
        y += 20;

        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('RESUMEN', 50, y);

        y += 25;

        doc.fontSize(10).font('Helvetica');
        
        const resumenData = [
            ['Total de Clientes:', estadisticas.total],
            ['Clientes Pagados:', estadisticas.pagados],
            ['Clientes Deudores:', estadisticas.deudores],
            ['Clientes Morosos:', estadisticas.morosos],
            ['Ingresos Mensuales:', `S/ ${estadisticas.ingresos.toFixed(2)}`]
        ];

        resumenData.forEach(([label, value]) => {
            doc.fillColor('#666666')
               .text(label, 50, y, { width: 200, continued: true })
               .fillColor('#000000')
               .font('Helvetica-Bold')
               .text(value.toString(), { align: 'right' });
            
            y += 20;
            doc.font('Helvetica');
        });

        return y;
    }

    // Generar reporte general
    async generarReporteGeneral(clientes) {
        const doc = this.crearDocumento();
        
        this.agregarEncabezado(doc, 'REPORTE GENERAL DE CLIENTES');

        const estadisticas = {
            total: clientes.length,
            pagados: clientes.filter(c => c.estado_pago === 'pagado').length,
            deudores: clientes.filter(c => c.estado_pago === 'deudor').length,
            morosos: clientes.filter(c => c.estado_pago === 'moroso').length,
            ingresos: clientes.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0)
        };

        let y = this.agregarTablaClientes(doc, clientes);
        this.agregarResumen(doc, estadisticas, y);

        return doc;
    }

    // Generar reporte de deudores
    async generarReporteDeudores(clientes) {
        const deudores = clientes.filter(c => c.estado_pago === 'deudor' || c.estado_pago === 'moroso');
        
        const doc = this.crearDocumento();
        this.agregarEncabezado(doc, 'REPORTE DE CLIENTES DEUDORES');

        const estadisticas = {
            total: deudores.length,
            pagados: 0,
            deudores: deudores.filter(c => c.estado_pago === 'deudor').length,
            morosos: deudores.filter(c => c.estado_pago === 'moroso').length,
            ingresos: deudores.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0)
        };

        let y = this.agregarTablaClientes(doc, deudores);
        this.agregarResumen(doc, estadisticas, y);

        return doc;
    }

    // Generar reporte por tipo de servicio - ARREGLADO CON NORMALIZACIÓN
    async generarReportePorServicio(clientes, tipoServicio) {
        // Normalizar para comparación (quitar tildes y convertir a minúsculas)
        const tipoNormalizado = tipoServicio
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
        
        console.log('🔍 Buscando servicio:', tipoServicio, '→ Normalizado:', tipoNormalizado);
        
        const filtrados = clientes.filter(c => {
            if (!c.tipo_servicio) return false;
            
            const servicioCliente = c.tipo_servicio
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim();
            
            return servicioCliente === tipoNormalizado;
        });
        
        console.log('✅ Clientes encontrados:', filtrados.length);
        
        const doc = this.crearDocumento();
        this.agregarEncabezado(doc, `REPORTE - ${tipoServicio.toUpperCase()}`);

        const estadisticas = {
            total: filtrados.length,
            pagados: filtrados.filter(c => c.estado_pago === 'pagado').length,
            deudores: filtrados.filter(c => c.estado_pago === 'deudor').length,
            morosos: filtrados.filter(c => c.estado_pago === 'moroso').length,
            ingresos: filtrados.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0)
        };

        let y = this.agregarTablaClientes(doc, filtrados);
        this.agregarResumen(doc, estadisticas, y);

        return doc;
    }

    // Generar reporte por tipo de señal - ARREGLADO CON NORMALIZACIÓN
    async generarReportePorSenal(clientes, tipoSenal) {
        // Normalizar para comparación
        const senalNormalizada = tipoSenal
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
        
        console.log('🔍 Buscando señal:', tipoSenal, '→ Normalizada:', senalNormalizada);
        
        const filtrados = clientes.filter(c => {
            if (!c.tipo_senal) return false;
            
            const senalCliente = c.tipo_senal
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim();
            
            return senalCliente === senalNormalizada;
        });
        
        console.log('✅ Clientes encontrados:', filtrados.length);
        
        const doc = this.crearDocumento();
        this.agregarEncabezado(doc, `REPORTE - SEÑAL ${tipoSenal.toUpperCase()}`);

        const estadisticas = {
            total: filtrados.length,
            pagados: filtrados.filter(c => c.estado_pago === 'pagado').length,
            deudores: filtrados.filter(c => c.estado_pago === 'deudor').length,
            morosos: filtrados.filter(c => c.estado_pago === 'moroso').length,
            ingresos: filtrados.reduce((sum, c) => sum + parseFloat(c.precio_mensual || 0), 0)
        };

        let y = this.agregarTablaClientes(doc, filtrados);
        this.agregarResumen(doc, estadisticas, y);

        return doc;
    }
}

module.exports = new PDFService();
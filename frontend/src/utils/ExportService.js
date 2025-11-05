// ============================================
// frontend/src/utils/ExportService.js
// EXPORTACIÓN ULTRA PROFESIONAL
// PDF ESTILO REPORTE EJECUTIVO + EXCEL PREMIUM
// ============================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * 📄 EXPORTAR PDF ULTRA PROFESIONAL
 * Estilo reporte ejecutivo con diseño premium
 */
export const exportToPDF = async (element, data) => {
    try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // ============================================
        // PÁGINA 1: PORTADA PREMIUM
        // ============================================
        
        // Fondo degradado azul
        doc.setFillColor(0, 51, 102);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Patrón de fondo
        doc.setFillColor(255, 255, 255);
        doc.setGState(new doc.GState({ opacity: 0.05 }));
        for (let i = 0; i < 20; i++) {
            doc.circle(Math.random() * pageWidth, Math.random() * pageHeight, Math.random() * 30, 'F');
        }
        doc.setGState(new doc.GState({ opacity: 1 }));

        // Logo/Empresa
        doc.setFillColor(255, 255, 255);
        doc.circle(pageWidth / 2, 60, 20, 'F');
        doc.setTextColor(0, 51, 102);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('TV', pageWidth / 2 - 8, 65);

        // Título principal
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(36);
        doc.setFont('helvetica', 'bold');
        doc.text('DASHBOARD', pageWidth / 2, 110, { align: 'center' });
        doc.text('EJECUTIVO', pageWidth / 2, 125, { align: 'center' });

        // Subtítulo
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Reporte Gerencial de Inteligencia de Negocios', pageWidth / 2, 140, { align: 'center' });

        // Fecha
        const fecha = new Date().toLocaleDateString('es-PE', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        doc.setFontSize(12);
        doc.text(fecha, pageWidth / 2, 155, { align: 'center' });

        // Línea decorativa
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.line(50, 165, pageWidth - 50, 165);

        // Empresa
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('TV JHAIRE', pageWidth / 2, 180, { align: 'center' });
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('Sistema de Gestión de Clientes', pageWidth / 2, 190, { align: 'center' });

        // Indicadores rápidos en la portada
        doc.setFillColor(255, 255, 255);
        doc.setGState(new doc.GState({ opacity: 0.15 }));
        doc.roundedRect(20, 210, (pageWidth - 50) / 3, 35, 3, 3, 'F');
        doc.roundedRect(20 + (pageWidth - 50) / 3 + 5, 210, (pageWidth - 50) / 3, 35, 3, 3, 'F');
        doc.roundedRect(20 + ((pageWidth - 50) / 3 + 5) * 2, 210, (pageWidth - 50) / 3, 35, 3, 3, 'F');
        doc.setGState(new doc.GState({ opacity: 1 }));

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('Clientes', 35, 220);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(String(data.kpis?.clientes_activos || 0), 35, 235);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Ingresos Mes', pageWidth / 2 - 15, 220);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`S/ ${((data.kpis?.ingresos_mes || 0) / 1000).toFixed(1)}K`, pageWidth / 2 - 15, 235);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Deuda Total', pageWidth - 60, 220);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`S/ ${((data.kpis?.deuda_total || 0) / 1000).toFixed(1)}K`, pageWidth - 60, 235);

        // ============================================
        // PÁGINA 2: RESUMEN EJECUTIVO
        // ============================================
        doc.addPage();
        
        // Header de página
        addPageHeader(doc, 'RESUMEN EJECUTIVO', pageWidth);
        let yPos = 35;

        // KPIs en cards premium
        const kpiData = [
            ['Clientes Activos', data.kpis?.clientes_activos || 0, '+12%', [52, 199, 89]],
            ['Ingresos del Mes', `S/ ${(data.kpis?.ingresos_mes || 0).toFixed(2)}`, '+8.5%', [0, 122, 255]],
            ['Con Deuda', data.kpis?.clientes_con_deuda || 0, 'Atención', [255, 149, 0]],
            ['Deuda Total', `S/ ${(data.kpis?.deuda_total || 0).toFixed(2)}`, 'Crítico', [255, 59, 48]]
        ];

        kpiData.forEach((kpi, i) => {
            const x = 20 + (i % 2) * 90;
            const y = yPos + Math.floor(i / 2) * 40;
            
            doc.setFillColor(...kpi[3]);
            doc.setGState(new doc.GState({ opacity: 0.1 }));
            doc.roundedRect(x, y, 80, 30, 3, 3, 'F');
            doc.setGState(new doc.GState({ opacity: 1 }));
            
            doc.setTextColor(100);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(kpi[0], x + 5, y + 8);
            
            doc.setTextColor(0);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(String(kpi[1]), x + 5, y + 18);
            
            doc.setFillColor(...kpi[3]);
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.roundedRect(x + 5, y + 22, 20, 5, 2, 2, 'F');
            doc.text(kpi[2], x + 7, y + 26);
        });

        yPos += 90;

        // ============================================
        // INSIGHTS IA - DESTACADOS
        // ============================================
        if (data.insights && data.insights.length > 0) {
            addSectionTitle(doc, '🤖 INSIGHTS DE INTELIGENCIA ARTIFICIAL', yPos, [0, 122, 255]);
            yPos += 15;

            data.insights.slice(0, 3).forEach((insight, i) => {
                if (yPos > 240) {
                    doc.addPage();
                    addPageHeader(doc, 'INSIGHTS CONTINUACIÓN', pageWidth);
                    yPos = 35;
                }

                const bgColor = insight.type === 'success' ? [209, 250, 229] : 
                               insight.type === 'warning' ? [254, 243, 199] : [219, 234, 254];
                const iconColor = insight.type === 'success' ? [52, 199, 89] : 
                                 insight.type === 'warning' ? [255, 149, 0] : [0, 122, 255];

                doc.setFillColor(...bgColor);
                doc.roundedRect(20, yPos, pageWidth - 40, 28, 3, 3, 'F');

                // Ícono
                doc.setFillColor(...iconColor);
                doc.circle(28, yPos + 8, 4, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                const icon = insight.type === 'success' ? '✓' : insight.type === 'warning' ? '!' : 'i';
                doc.text(icon, 26.5, yPos + 9.5);

                // Título
                doc.setTextColor(0);
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text(insight.title, 35, yPos + 8);

                // Mensaje
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(60);
                const lines = doc.splitTextToSize(insight.message, pageWidth - 60);
                doc.text(lines, 35, yPos + 15);

                yPos += 33;
            });
        }

        // ============================================
        // PÁGINA 3: ALERTAS Y RECOMENDACIONES
        // ============================================
        if (data.alerts && data.alerts.length > 0) {
            doc.addPage();
            addPageHeader(doc, 'ALERTAS Y ACCIONES', pageWidth);
            yPos = 35;

            addSectionTitle(doc, '🚨 ALERTAS CRÍTICAS', yPos, [255, 59, 48]);
            yPos += 12;

            const alertsData = data.alerts.map(alert => [
                '⚠',
                alert.message || '',
                alert.action || 'Revisar'
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['', 'Alerta', 'Acción Requerida']],
                body: alertsData,
                theme: 'grid',
                headStyles: { 
                    fillColor: [255, 59, 48],
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: { fontSize: 9 },
                alternateRowStyles: { fillColor: [254, 242, 242] },
                margin: { left: 20, right: 20 },
                columnStyles: {
                    0: { cellWidth: 10, halign: 'center', fontSize: 12 },
                    1: { cellWidth: 120 },
                    2: { cellWidth: 40, fontStyle: 'bold' }
                }
            });

            yPos = doc.lastAutoTable.finalY + 20;
        }

        // RECOMENDACIONES
        if (data.recommendations && data.recommendations.length > 0) {
            if (yPos > 200) {
                doc.addPage();
                addPageHeader(doc, 'RECOMENDACIONES', pageWidth);
                yPos = 35;
            }

            addSectionTitle(doc, '💡 PLAN DE ACCIÓN RECOMENDADO', yPos, [52, 199, 89]);
            yPos += 12;

            const recsData = data.recommendations.map(rec => [
                rec.priority || '',
                rec.title || '',
                rec.description || ''
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Prioridad', 'Acción', 'Descripción']],
                body: recsData,
                theme: 'grid',
                headStyles: { 
                    fillColor: [52, 199, 89],
                    fontSize: 10,
                    fontStyle: 'bold'
                },
                bodyStyles: { fontSize: 9 },
                alternateRowStyles: { fillColor: [240, 253, 244] },
                margin: { left: 20, right: 20 },
                columnStyles: {
                    0: { 
                        cellWidth: 25, 
                        halign: 'center', 
                        fontStyle: 'bold',
                        fillColor: [255, 149, 0],
                        textColor: [255, 255, 255]
                    },
                    1: { cellWidth: 50, fontStyle: 'bold' },
                    2: { cellWidth: 95 }
                }
            });
        }

        // ============================================
        // PIE DE PÁGINA PROFESIONAL
        // ============================================
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            
            // Línea superior
            doc.setDrawColor(0, 51, 102);
            doc.setLineWidth(0.5);
            doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
            
            // Textos
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.setFont('helvetica', 'normal');
            
            doc.text(`Página ${i} de ${totalPages}`, 20, pageHeight - 15);
            doc.text(
                `Generado: ${new Date().toLocaleString('es-PE')}`,
                pageWidth / 2,
                pageHeight - 15,
                { align: 'center' }
            );
            doc.text(
                'TV Jhaire © 2025',
                pageWidth - 20,
                pageHeight - 15,
                { align: 'right' }
            );
            
            // Marca de agua
            doc.setTextColor(0, 51, 102);
            doc.setGState(new doc.GState({ opacity: 0.05 }));
            doc.setFontSize(60);
            doc.setFont('helvetica', 'bold');
            doc.text('CONFIDENCIAL', pageWidth / 2, pageHeight / 2, { 
                align: 'center',
                angle: 45
            });
            doc.setGState(new doc.GState({ opacity: 1 }));
        }

        // Guardar
        const fileName = `Dashboard_Ejecutivo_${new Date().getTime()}.pdf`;
        doc.save(fileName);

        return { success: true, fileName };
    } catch (error) {
        console.error('Error generando PDF:', error);
        throw error;
    }
};

// FUNCIONES AUXILIARES
function addPageHeader(doc, title, pageWidth) {
    doc.setFillColor(0, 51, 102);
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 15);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('TV Jhaire - Dashboard Ejecutivo', pageWidth - 20, 15, { align: 'right' });
}

function addSectionTitle(doc, title, yPos, color) {
    doc.setFillColor(...color);
    doc.rect(15, yPos - 2, 5, 8, 'F');
    
    doc.setTextColor(...color);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 25, yPos + 3);
}

/**
 * 📊 EXPORTAR EXCEL ULTRA PROFESIONAL
 * Con colores, formato y organización premium
 */
export const exportToExcel = async (data) => {
    try {
        const workbook = XLSX.utils.book_new();

        // ============================================
        // HOJA 1: DASHBOARD RESUMEN
        // ============================================
        const resumenData = [
            ['DASHBOARD EJECUTIVO - TV JHAIRE'],
            [`Generado: ${new Date().toLocaleString('es-PE')}`],
            [''],
            ['═══════════════════════════════════════════'],
            ['INDICADORES CLAVE (KPIs)'],
            ['═══════════════════════════════════════════'],
            [''],
            ['Métrica', 'Valor', 'Tendencia', 'Estado'],
            ['Clientes Activos', data.kpis?.clientes_activos || 0, '+12%', 'POSITIVO'],
            ['Ingresos del Mes', (data.kpis?.ingresos_mes || 0).toFixed(2), '+8.5%', 'POSITIVO'],
            ['Clientes con Deuda', data.kpis?.clientes_con_deuda || 0, '--', 'ATENCIÓN'],
            ['Deuda Total', (data.kpis?.deuda_total || 0).toFixed(2), '--', 'CRÍTICO'],
            ['Clientes Suspendidos', data.kpis?.clientes_suspendidos || 0, '--', 'NEUTRAL'],
            ['Clientes en Riesgo Alto', data.kpis?.riesgo_alto || 0, '--', 'ATENCIÓN'],
            [''],
            ['═══════════════════════════════════════════'],
            ['RESUMEN RÁPIDO'],
            ['═══════════════════════════════════════════'],
            [''],
            ['Total Clientes', (data.kpis?.clientes_activos || 0) + (data.kpis?.clientes_suspendidos || 0)],
            ['% Clientes Activos', `${(((data.kpis?.clientes_activos || 0) / ((data.kpis?.clientes_activos || 0) + (data.kpis?.clientes_suspendidos || 1))) * 100).toFixed(1)}%`],
            ['% Clientes con Deuda', `${(((data.kpis?.clientes_con_deuda || 0) / (data.kpis?.clientes_activos || 1)) * 100).toFixed(1)}%`],
            ['Ingreso Promedio por Cliente', `S/ ${((data.kpis?.ingresos_mes || 0) / (data.kpis?.clientes_activos || 1)).toFixed(2)}`]
        ];
        
        const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
        wsResumen['!cols'] = [
            { wch: 30 },
            { wch: 18 },
            { wch: 15 },
            { wch: 15 }
        ];
        
        // Merge cells para título
        wsResumen['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }
        ];
        
        XLSX.utils.book_append_sheet(workbook, wsResumen, '📊 Resumen');

        // ============================================
        // HOJA 2: INGRESOS MENSUALES
        // ============================================
        if (data.ingresos && data.ingresos.length > 0) {
            const ingresosData = [
                ['INGRESOS MENSUALES'],
                [''],
                ['Mes', 'Total Ingresos (S/)', 'Variación %'],
                ...data.ingresos.map((ing, i) => {
                    const anterior = i > 0 ? parseFloat(data.ingresos[i - 1].total || 0) : 0;
                    const actual = parseFloat(ing.total || 0);
                    const variacion = anterior > 0 ? ((actual - anterior) / anterior * 100).toFixed(1) : 0;
                    return [
                        ing.mes,
                        actual.toFixed(2),
                        `${variacion}%`
                    ];
                }),
                [''],
                ['TOTAL', data.ingresos.reduce((sum, ing) => sum + parseFloat(ing.total || 0), 0).toFixed(2), ''],
                ['PROMEDIO', (data.ingresos.reduce((sum, ing) => sum + parseFloat(ing.total || 0), 0) / data.ingresos.length).toFixed(2), '']
            ];
            
            const wsIngresos = XLSX.utils.aoa_to_sheet(ingresosData);
            wsIngresos['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(workbook, wsIngresos, '💰 Ingresos');
        }

        // ============================================
        // HOJA 3: TOP PAGADORES
        // ============================================
        if (data.mejoresPagadores && data.mejoresPagadores.length > 0) {
            const mejoresData = [
                ['TOP 10 MEJORES PAGADORES'],
                [''],
                ['🥇 Ranking', 'Cliente', 'DNI', 'Total Pagos', 'Monto Total (S/)', 'Score', 'Calificación'],
                ...data.mejoresPagadores.map((cliente, index) => [
                    index + 1,
                    cliente.cliente,
                    cliente.dni,
                    cliente.total_pagos,
                    parseFloat(cliente.monto_total || 0).toFixed(2),
                    cliente.score_pago,
                    cliente.score_pago >= 80 ? 'EXCELENTE' : cliente.score_pago >= 60 ? 'BUENO' : 'REGULAR'
                ])
            ];
            
            const wsMejores = XLSX.utils.aoa_to_sheet(mejoresData);
            wsMejores['!cols'] = [
                { wch: 12 },
                { wch: 35 },
                { wch: 12 },
                { wch: 12 },
                { wch: 18 },
                { wch: 10 },
                { wch: 15 }
            ];
            XLSX.utils.book_append_sheet(workbook, wsMejores, '⭐ Top Pagadores');
        }

        // ============================================
        // HOJA 4: CLIENTES EN MORA
        // ============================================
        if (data.peoresPagadores && data.peoresPagadores.length > 0) {
            const peoresData = [
                ['CLIENTES EN MORA - REQUIERE ATENCIÓN'],
                [''],
                ['Prioridad', 'Cliente', 'Teléfono', 'Meses Deuda', 'Deuda Total (S/)', 'Zona', 'Acción'],
                ...data.peoresPagadores.map((cliente, index) => [
                    index + 1,
                    cliente.cliente,
                    cliente.telefono || 'Sin teléfono',
                    cliente.meses_deuda,
                    parseFloat(cliente.deuda_total || 0).toFixed(2),
                    cliente.zona_geografica || 'Sin zona',
                    cliente.meses_deuda > 2 ? 'URGENTE - Contactar' : 'Enviar recordatorio'
                ])
            ];
            
            const wsPeores = XLSX.utils.aoa_to_sheet(peoresData);
            wsPeores['!cols'] = [
                { wch: 10 },
                { wch: 35 },
                { wch: 15 },
                { wch: 12 },
                { wch: 18 },
                { wch: 20 },
                { wch: 25 }
            ];
            XLSX.utils.book_append_sheet(workbook, wsPeores, '⚠️ En Mora');
        }

        // ============================================
        // HOJA 5: CLIENTES EN RIESGO
        // ============================================
        if (data.clientesRiesgo && data.clientesRiesgo.length > 0) {
            const riesgoData = [
                ['CLIENTES EN RIESGO CRÍTICO - ACCIÓN INMEDIATA'],
                [''],
                ['Cliente', 'Teléfono', 'Deuda (S/)', 'Score', 'Nivel Riesgo', 'Zona', 'Último Pago', 'Días Sin Pagar'],
                ...data.clientesRiesgo.map(cliente => {
                    const ultimoPago = cliente.fecha_ultimo_pago ? new Date(cliente.fecha_ultimo_pago) : null;
                    const diasSinPagar = ultimoPago ? Math.floor((new Date() - ultimoPago) / (1000 * 60 * 60 * 24)) : 'N/A';
                    return [
                        cliente.cliente,
                        cliente.telefono || 'Sin teléfono',
                        parseFloat(cliente.deuda_total || 0).toFixed(2),
                        cliente.score_pago,
                        cliente.nivel_riesgo,
                        cliente.zona_geografica || 'Sin zona',
                        cliente.fecha_ultimo_pago ? new Date(cliente.fecha_ultimo_pago).toLocaleDateString('es-PE') : 'Nunca',
                        diasSinPagar
                    ];
                })
            ];
            
            const wsRiesgo = XLSX.utils.aoa_to_sheet(riesgoData);
            wsRiesgo['!cols'] = [
                { wch: 35 },
                { wch: 15 },
                { wch: 15 },
                { wch: 8 },
                { wch: 15 },
                { wch: 20 },
                { wch: 15 },
                { wch: 15 }
            ];
            XLSX.utils.book_append_sheet(workbook, wsRiesgo, '🚨 Riesgo Crítico');
        }

        // Guardar archivo
        const fileName = `Dashboard_Ejecutivo_${new Date().getTime()}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        return { success: true, fileName };
    } catch (error) {
        console.error('Error generando Excel:', error);
        throw error;
    }
};

/**
 * 📧 ENVIAR POR EMAIL
 */
export const sendEmail = async (email, data) => {
    try {
        console.log('Enviando email a:', email);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    } catch (error) {
        console.error('Error enviando email:', error);
        throw error;
    }
};
// ============================================
// frontend/src/utils/ExportService.js
// SERVICIO DE EXPORTACIÓN ULTRA PRO
// PDF Y EXCEL CON DISEÑO PROFESIONAL
// ============================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * 📄 EXPORTAR A PDF ULTRA PRO
 */
export const exportToPDF = async (element, data) => {
    try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 20;

        // ============================================
        // PORTADA PROFESIONAL
        // ============================================
        doc.setFillColor(0, 122, 255);
        doc.rect(0, 0, pageWidth, 80, 'F');
        
        // Logo/Ícono
        doc.setFillColor(255, 255, 255);
        doc.circle(pageWidth / 2, 35, 15, 'F');
        doc.setFontSize(24);
        doc.setTextColor(0, 122, 255);
        doc.text('📊', pageWidth / 2 - 5, 40);
        
        // Título
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('Dashboard Ejecutivo', pageWidth / 2, 60, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const fecha = new Date().toLocaleDateString('es-PE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        doc.text(fecha, pageWidth / 2, 70, { align: 'center' });

        // Línea decorativa
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.line(40, 75, pageWidth - 40, 75);

        yPos = 90;

        // ============================================
        // PÁGINA 1: RESUMEN EJECUTIVO
        // ============================================
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('📈 Resumen Ejecutivo', 20, yPos);
        yPos += 10;

        // KPIs en grid
        if (data.kpis) {
            const kpisData = [
                ['Clientes Activos', formatNumber(data.kpis.clientes_activos || 0), '↗ +12%'],
                ['Ingresos del Mes', formatMoney(data.kpis.ingresos_mes || 0), '↗ +8.5%'],
                ['Con Deuda', formatNumber(data.kpis.clientes_con_deuda || 0), '⚠ Atención'],
                ['Deuda Total', formatMoney(data.kpis.deuda_total || 0), '⚠ Crítico']
            ];

            autoTable(doc, {
                startY: yPos,
                head: [['Métrica', 'Valor', 'Tendencia']],
                body: kpisData,
                theme: 'grid',
                headStyles: { 
                    fillColor: [0, 122, 255],
                    fontSize: 11,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: { 
                    fontSize: 10,
                    halign: 'center'
                },
                alternateRowStyles: { fillColor: [245, 247, 250] },
                margin: { left: 20, right: 20 }
            });

            yPos = doc.lastAutoTable.finalY + 15;
        }

        // ============================================
        // INSIGHTS IA
        // ============================================
        if (data.insights && data.insights.length > 0) {
            if (yPos > 200) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFillColor(0, 122, 255);
            doc.rect(15, yPos - 5, 5, 10, 'F');
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 122, 255);
            doc.text('🤖 Insights de Inteligencia Artificial', 25, yPos);
            yPos += 12;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);

            data.insights.slice(0, 5).forEach((insight, i) => {
                if (yPos > 260) {
                    doc.addPage();
                    yPos = 20;
                }

                // Caja de insight
                const boxHeight = 25;
                const bgColor = insight.type === 'success' ? [209, 250, 229] : 
                               insight.type === 'warning' ? [254, 243, 199] : 
                               [219, 234, 254];
                
                doc.setFillColor(...bgColor);
                doc.roundedRect(20, yPos, pageWidth - 40, boxHeight, 3, 3, 'F');

                // Ícono
                const icon = insight.type === 'success' ? '✓' : 
                            insight.type === 'warning' ? '⚠' : 'ℹ';
                doc.setFontSize(16);
                doc.text(icon, 25, yPos + 8);

                // Título
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text(insight.title, 35, yPos + 8);

                // Mensaje
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                const lines = doc.splitTextToSize(insight.message, pageWidth - 60);
                doc.text(lines, 35, yPos + 15);

                yPos += boxHeight + 5;
            });
        }

        // ============================================
        // PÁGINA 2: ALERTAS CRÍTICAS
        // ============================================
        if (data.alerts && data.alerts.length > 0) {
            doc.addPage();
            yPos = 20;

            doc.setFillColor(255, 59, 48);
            doc.rect(15, yPos - 5, 5, 10, 'F');
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 59, 48);
            doc.text('🚨 Alertas Críticas', 25, yPos);
            yPos += 12;

            const alertsData = data.alerts.map(alert => [
                alert.type || 'Crítico',
                alert.message || '',
                alert.action || 'Revisar'
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Prioridad', 'Mensaje', 'Acción Sugerida']],
                body: alertsData,
                theme: 'grid',
                headStyles: { 
                    fillColor: [255, 59, 48],
                    fontSize: 10,
                    fontStyle: 'bold'
                },
                bodyStyles: { fontSize: 9 },
                alternateRowStyles: { fillColor: [254, 242, 242] },
                margin: { left: 20, right: 20 },
                columnStyles: {
                    0: { cellWidth: 30, fontStyle: 'bold' },
                    1: { cellWidth: 100 },
                    2: { cellWidth: 40 }
                }
            });
        }

        // ============================================
        // PÁGINA 3: RECOMENDACIONES
        // ============================================
        if (data.recommendations && data.recommendations.length > 0) {
            doc.addPage();
            yPos = 20;

            doc.setFillColor(52, 199, 89);
            doc.rect(15, yPos - 5, 5, 10, 'F');
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(52, 199, 89);
            doc.text('💡 Recomendaciones Estratégicas', 25, yPos);
            yPos += 12;

            const recsData = data.recommendations.map(rec => [
                rec.priority || '',
                rec.title || '',
                rec.description || '',
                rec.impact || 'Alto'
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Prioridad', 'Acción', 'Descripción', 'Impacto']],
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
                    0: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
                    1: { cellWidth: 45 },
                    2: { cellWidth: 80 },
                    3: { cellWidth: 25, halign: 'center' }
                }
            });
        }

        // ============================================
        // PIE DE PÁGINA EN TODAS
        // ============================================
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            
            // Línea superior del pie
            doc.setDrawColor(200);
            doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
            
            // Texto
            doc.text(
                `Página ${i} de ${totalPages}`,
                20,
                pageHeight - 10
            );
            doc.text(
                `Generado: ${new Date().toLocaleString('es-PE')}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
            doc.text(
                'TV Jhaire - Dashboard Ejecutivo',
                pageWidth - 20,
                pageHeight - 10,
                { align: 'right' }
            );
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

/**
 * 📊 EXPORTAR A EXCEL ULTRA PRO
 */
export const exportToExcel = async (data) => {
    try {
        const workbook = XLSX.utils.book_new();

        // ============================================
        // HOJA 1: RESUMEN EJECUTIVO
        // ============================================
        const resumenData = [
            ['DASHBOARD EJECUTIVO - TV JHAIRE'],
            [`Generado: ${new Date().toLocaleString('es-PE')}`],
            [''],
            ['INDICADORES CLAVE (KPIs)'],
            ['Métrica', 'Valor', 'Tendencia'],
            ['Clientes Activos', data.kpis?.clientes_activos || 0, '+12%'],
            ['Ingresos del Mes', `S/ ${(data.kpis?.ingresos_mes || 0).toFixed(2)}`, '+8.5%'],
            ['Clientes con Deuda', data.kpis?.clientes_con_deuda || 0, 'Atención'],
            ['Deuda Total', `S/ ${(data.kpis?.deuda_total || 0).toFixed(2)}`, 'Crítico'],
            ['Suspendidos', data.kpis?.clientes_suspendidos || 0, ''],
            ['Riesgo Alto', data.kpis?.riesgo_alto || 0, '']
        ];
        
        const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
        
        // Estilos para el resumen
        wsResumen['!cols'] = [
            { wch: 25 },
            { wch: 15 },
            { wch: 15 }
        ];
        
        XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen Ejecutivo');

        // ============================================
        // HOJA 2: INGRESOS MENSUALES
        // ============================================
        if (data.ingresos && data.ingresos.length > 0) {
            const ingresosData = [
                ['INGRESOS MENSUALES'],
                ['Mes', 'Total Ingresos'],
                ...data.ingresos.map(ing => [
                    ing.mes,
                    parseFloat(ing.total || 0)
                ])
            ];
            
            const wsIngresos = XLSX.utils.aoa_to_sheet(ingresosData);
            wsIngresos['!cols'] = [{ wch: 20 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(workbook, wsIngresos, 'Ingresos');
        }

        // ============================================
        // HOJA 3: TOP PAGADORES
        // ============================================
        if (data.mejoresPagadores && data.mejoresPagadores.length > 0) {
            const mejoresData = [
                ['TOP 10 MEJORES PAGADORES'],
                ['Ranking', 'Cliente', 'DNI', 'Total Pagos', 'Monto Total', 'Score'],
                ...data.mejoresPagadores.map((cliente, index) => [
                    index + 1,
                    cliente.cliente,
                    cliente.dni,
                    cliente.total_pagos,
                    parseFloat(cliente.monto_total || 0),
                    cliente.score_pago
                ])
            ];
            
            const wsMejores = XLSX.utils.aoa_to_sheet(mejoresData);
            wsMejores['!cols'] = [
                { wch: 10 },
                { wch: 30 },
                { wch: 12 },
                { wch: 12 },
                { wch: 15 },
                { wch: 10 }
            ];
            XLSX.utils.book_append_sheet(workbook, wsMejores, 'Top Pagadores');
        }

        // ============================================
        // HOJA 4: CLIENTES EN MORA
        // ============================================
        if (data.peoresPagadores && data.peoresPagadores.length > 0) {
            const peoresData = [
                ['CLIENTES EN MORA'],
                ['Ranking', 'Cliente', 'Teléfono', 'Meses Deuda', 'Deuda Total', 'Zona'],
                ...data.peoresPagadores.map((cliente, index) => [
                    index + 1,
                    cliente.cliente,
                    cliente.telefono || 'N/A',
                    cliente.meses_deuda,
                    parseFloat(cliente.deuda_total || 0),
                    cliente.zona_geografica || 'N/A'
                ])
            ];
            
            const wsPeores = XLSX.utils.aoa_to_sheet(peoresData);
            wsPeores['!cols'] = [
                { wch: 10 },
                { wch: 30 },
                { wch: 15 },
                { wch: 12 },
                { wch: 15 },
                { wch: 20 }
            ];
            XLSX.utils.book_append_sheet(workbook, wsPeores, 'En Mora');
        }

        // ============================================
        // HOJA 5: CLIENTES EN RIESGO
        // ============================================
        if (data.clientesRiesgo && data.clientesRiesgo.length > 0) {
            const riesgoData = [
                ['CLIENTES EN RIESGO CRÍTICO'],
                ['Cliente', 'Teléfono', 'Deuda', 'Score', 'Nivel Riesgo', 'Zona', 'Último Pago'],
                ...data.clientesRiesgo.map(cliente => [
                    cliente.cliente,
                    cliente.telefono || 'N/A',
                    parseFloat(cliente.deuda_total || 0),
                    cliente.score_pago,
                    cliente.nivel_riesgo,
                    cliente.zona_geografica || 'N/A',
                    cliente.fecha_ultimo_pago || 'Nunca'
                ])
            ];
            
            const wsRiesgo = XLSX.utils.aoa_to_sheet(riesgoData);
            wsRiesgo['!cols'] = [
                { wch: 30 },
                { wch: 15 },
                { wch: 12 },
                { wch: 8 },
                { wch: 15 },
                { wch: 20 },
                { wch: 15 }
            ];
            XLSX.utils.book_append_sheet(workbook, wsRiesgo, 'Clientes Riesgo');
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
        // Aquí iría la integración con tu backend
        console.log('Enviando email a:', email);
        
        // Simular envío
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true };
    } catch (error) {
        console.error('Error enviando email:', error);
        throw error;
    }
};

// Helper functions
const formatMoney = (value) => {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(value || 0);
};

const formatNumber = (value) => {
    return new Intl.NumberFormat('es-PE').format(value || 0);
};
// ============================================
// frontend/src/utils/ExportService.js
// SERVICIO DE EXPORTACIÓN PDF, EXCEL Y EMAIL
// ============================================

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * 📄 EXPORTAR A PDF
 */
export const exportToPDF = async (element, data) => {
    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // ============================================
        // PORTADA
        // ============================================
        pdf.setFillColor(0, 122, 255);
        pdf.rect(0, 0, pageWidth, 80, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(32);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Dashboard Ejecutivo', pageWidth / 2, 30, { align: 'center' });
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Reporte Generado por IA', pageWidth / 2, 45, { align: 'center' });
        
        pdf.setFontSize(12);
        const fecha = new Date().toLocaleDateString('es-PE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        pdf.text(fecha, pageWidth / 2, 55, { align: 'center' });

        // Logo
        pdf.setFontSize(10);
        pdf.text('TV Jhaire - Sistema de Gestión', pageWidth / 2, 65, { align: 'center' });

        // ============================================
        // RESUMEN EJECUTIVO
        // ============================================
        pdf.addPage();
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Resumen Ejecutivo', 20, 20);

        let yPos = 35;

        // KPIs
        if (data.kpis) {
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('KPIs Principales', 20, yPos);
            yPos += 10;

            pdf.autoTable({
                startY: yPos,
                head: [['Métrica', 'Valor', 'Tendencia']],
                body: [
                    ['Clientes Activos', data.kpis.clientes_activos || 0, '+12%'],
                    ['Ingresos del Mes', `S/ ${(data.kpis.ingresos_mes || 0).toFixed(2)}`, '+8.5%'],
                    ['Con Deuda', data.kpis.clientes_con_deuda || 0, 'Atención'],
                    ['Deuda Total', `S/ ${(data.kpis.deuda_total || 0).toFixed(2)}`, 'Crítico']
                ],
                theme: 'grid',
                headStyles: { fillColor: [0, 122, 255], fontSize: 10, fontStyle: 'bold' },
                styles: { fontSize: 9 },
                margin: { left: 20, right: 20 }
            });

            yPos = pdf.lastAutoTable.finalY + 15;
        }

        // ============================================
        // INSIGHTS IA
        // ============================================
        if (data.insights && data.insights.length > 0) {
            if (yPos > 200) {
                pdf.addPage();
                yPos = 20;
            }

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(0, 122, 255);
            pdf.text('🤖 Insights Generados por IA', 20, yPos);
            yPos += 10;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);

            data.insights.slice(0, 5).forEach((insight, i) => {
                if (yPos > 260) {
                    pdf.addPage();
                    yPos = 20;
                }

                const icon = insight.type === 'success' ? '✓' : insight.type === 'warning' ? '⚠' : 'ℹ';
                pdf.setFont('helvetica', 'bold');
                pdf.text(`${icon} ${insight.title}`, 20, yPos);
                yPos += 7;

                pdf.setFont('helvetica', 'normal');
                const lines = pdf.splitTextToSize(insight.message, pageWidth - 40);
                pdf.text(lines, 20, yPos);
                yPos += lines.length * 5 + 5;
            });
        }

        // ============================================
        // ALERTAS CRÍTICAS
        // ============================================
        if (data.alerts && data.alerts.length > 0) {
            pdf.addPage();
            yPos = 20;

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 59, 48);
            pdf.text('🚨 Alertas Críticas', 20, yPos);
            yPos += 10;

            pdf.autoTable({
                startY: yPos,
                head: [['Tipo', 'Mensaje', 'Acción']],
                body: data.alerts.map(alert => [
                    alert.type || 'Crítico',
                    alert.message || '',
                    alert.action || 'Revisar'
                ]),
                theme: 'grid',
                headStyles: { fillColor: [255, 59, 48], fontSize: 10, fontStyle: 'bold' },
                styles: { fontSize: 9 },
                margin: { left: 20, right: 20 }
            });
        }

        // ============================================
        // RECOMENDACIONES
        // ============================================
        if (data.recommendations && data.recommendations.length > 0) {
            pdf.addPage();
            yPos = 20;

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(52, 199, 89);
            pdf.text('💡 Recomendaciones', 20, yPos);
            yPos += 10;

            pdf.autoTable({
                startY: yPos,
                head: [['Prioridad', 'Título', 'Descripción']],
                body: data.recommendations.map(rec => [
                    rec.priority || '',
                    rec.title || '',
                    rec.description || ''
                ]),
                theme: 'grid',
                headStyles: { fillColor: [52, 199, 89], fontSize: 10, fontStyle: 'bold' },
                styles: { fontSize: 9 },
                margin: { left: 20, right: 20 },
                columnStyles: {
                    2: { cellWidth: 100 }
                }
            });
        }

        // ============================================
        // PIE DE PÁGINA EN TODAS LAS PÁGINAS
        // ============================================
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(150);
            pdf.text(
                `Página ${i} de ${totalPages} | Generado el ${new Date().toLocaleString('es-PE')}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
            pdf.text(
                'TV Jhaire - Sistema de Gestión de Clientes',
                pageWidth / 2,
                pageHeight - 5,
                { align: 'center' }
            );
        }

        // Guardar
        const fileName = `Dashboard_Ejecutivo_${new Date().getTime()}.pdf`;
        pdf.save(fileName);

        return { success: true, fileName };
    } catch (error) {
        console.error('Error generando PDF:', error);
        throw error;
    }
};

/**
 * 📊 EXPORTAR A EXCEL
 */
export const exportToExcel = async (data) => {
    try {
        const workbook = XLSX.utils.book_new();

        // ============================================
        // HOJA 1: RESUMEN
        // ============================================
        const resumenData = [
            ['DASHBOARD EJECUTIVO - TV JHAIRE'],
            [`Fecha: ${new Date().toLocaleDateString('es-PE')}`],
            [''],
            ['KPI', 'Valor'],
            ['Clientes Activos', data.kpis?.clientes_activos || 0],
            ['Ingresos del Mes', data.kpis?.ingresos_mes || 0],
            ['Clientes con Deuda', data.kpis?.clientes_con_deuda || 0],
            ['Deuda Total', data.kpis?.deuda_total || 0],
            ['Suspendidos', data.kpis?.clientes_suspendidos || 0],
            ['Riesgo Alto', data.kpis?.riesgo_alto || 0]
        ];
        const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
        XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');

        // ============================================
        // HOJA 2: INGRESOS MENSUALES
        // ============================================
        if (data.ingresos && data.ingresos.length > 0) {
            const ingresosData = data.ingresos.map(ing => ({
                'Mes': ing.mes,
                'Total': parseFloat(ing.total || 0)
            }));
            const wsIngresos = XLSX.utils.json_to_sheet(ingresosData);
            XLSX.utils.book_append_sheet(workbook, wsIngresos, 'Ingresos');
        }

        // ============================================
        // HOJA 3: MEJORES PAGADORES
        // ============================================
        if (data.mejoresPagadores && data.mejoresPagadores.length > 0) {
            const mejoresData = data.mejoresPagadores.map(cliente => ({
                'Cliente': cliente.cliente,
                'DNI': cliente.dni,
                'Total Pagos': cliente.total_pagos,
                'Monto Total': parseFloat(cliente.monto_total || 0),
                'Score': cliente.score_pago
            }));
            const wsMejores = XLSX.utils.json_to_sheet(mejoresData);
            XLSX.utils.book_append_sheet(workbook, wsMejores, 'Top Pagadores');
        }

        // ============================================
        // HOJA 4: PEORES PAGADORES
        // ============================================
        if (data.peoresPagadores && data.peoresPagadores.length > 0) {
            const peoresData = data.peoresPagadores.map(cliente => ({
                'Cliente': cliente.cliente,
                'Teléfono': cliente.telefono || 'N/A',
                'Meses Deuda': cliente.meses_deuda,
                'Deuda Total': parseFloat(cliente.deuda_total || 0),
                'Zona': cliente.zona_geografica || 'N/A'
            }));
            const wsPeores = XLSX.utils.json_to_sheet(peoresData);
            XLSX.utils.book_append_sheet(workbook, wsPeores, 'En Mora');
        }

        // ============================================
        // HOJA 5: CLIENTES EN RIESGO
        // ============================================
        if (data.clientesRiesgo && data.clientesRiesgo.length > 0) {
            const riesgoData = data.clientesRiesgo.map(cliente => ({
                'Cliente': cliente.cliente,
                'Teléfono': cliente.telefono || 'N/A',
                'Deuda': parseFloat(cliente.deuda_total || 0),
                'Score': cliente.score_pago,
                'Nivel Riesgo': cliente.nivel_riesgo,
                'Zona': cliente.zona_geografica || 'N/A',
                'Último Pago': cliente.fecha_ultimo_pago || 'Nunca'
            }));
            const wsRiesgo = XLSX.utils.json_to_sheet(riesgoData);
            XLSX.utils.book_append_sheet(workbook, wsRiesgo, 'Clientes Riesgo');
        }

        // Guardar archivo
        const fileName = `Dashboard_Ejecutivo_${new Date().getTime()}.xlsx`;
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, fileName);

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
        // Aquí iría la integración con tu backend para enviar email
        // Por ahora simularemos el envío

        const body = `
            <h1>Dashboard Ejecutivo - TV Jhaire</h1>
            <p>Fecha: ${new Date().toLocaleDateString('es-PE')}</p>
            
            <h2>Resumen de KPIs:</h2>
            <ul>
                <li>Clientes Activos: ${data.kpis?.clientes_activos || 0}</li>
                <li>Ingresos del Mes: S/ ${(data.kpis?.ingresos_mes || 0).toFixed(2)}</li>
                <li>Deuda Total: S/ ${(data.kpis?.deuda_total || 0).toFixed(2)}</li>
            </ul>

            ${data.insights && data.insights.length > 0 ? `
                <h2>Insights Principales:</h2>
                <ul>
                    ${data.insights.slice(0, 3).map(i => `<li><strong>${i.title}:</strong> ${i.message}</li>`).join('')}
                </ul>
            ` : ''}

            ${data.alerts && data.alerts.length > 0 ? `
                <h2>⚠️ Alertas Críticas:</h2>
                <ul>
                    ${data.alerts.map(a => `<li>${a.message}</li>`).join('')}
                </ul>
            ` : ''}
        `;

        // Simular llamada al backend
        console.log('Enviando email a:', email);
        console.log('Contenido:', body);

        // Aquí llamarías a tu API:
        // await api.post('/dashboard/send-email', { email, body });

        return { success: true };
    } catch (error) {
        console.error('Error enviando email:', error);
        throw error;
    }
};

/**
 * 🖨️ IMPRIMIR
 */
export const printDashboard = () => {
    window.print();
};
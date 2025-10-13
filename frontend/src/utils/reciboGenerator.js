import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generarReciboPDF = async (pago, cliente) => {
    console.log('📄 generarReciboPDF - Datos recibidos:', { pago, cliente });
    
    // 🔧 ESPERAR A QUE EL DOM SE ACTUALICE
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const elemento = document.getElementById('recibo-print');
   
    if (!elemento) {
        console.error('❌ Elemento recibo-print no encontrado');
        alert('Error: No se pudo generar el recibo');
        return;
    }
    
    console.log('✅ Elemento encontrado, capturando...');
    
    try {
        // Capturar el elemento como imagen con mejor calidad
        const canvas = await html2canvas(elemento, {
            scale: 3, // Mayor calidad
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: true,
            width: elemento.scrollWidth,
            height: elemento.scrollHeight,
            windowWidth: elemento.scrollWidth,
            windowHeight: elemento.scrollHeight
        });
        
        const imgData = canvas.toDataURL('image/png');
       
        // Crear PDF en formato A4
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgWidth = 210; // A4 width
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Descargar
        const nombreArchivo = `Recibo_${cliente.nombre}_${cliente.apellido}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(nombreArchivo);
        
        console.log('✅ PDF generado exitosamente:', nombreArchivo);
    } catch (error) {
        console.error('❌ Error generando PDF:', error);
        alert('Error al generar el PDF: ' + error.message);
    }
};

export const imprimirRecibo = async (pago, cliente) => {
    console.log('🖨️ imprimirRecibo - Datos recibidos:', { pago, cliente });
    
    // 🔧 ESPERAR A QUE EL DOM SE ACTUALICE
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const elemento = document.getElementById('recibo-print');
   
    if (!elemento) {
        console.error('❌ Elemento recibo-print no encontrado');
        alert('Error: No se pudo imprimir el recibo');
        return;
    }
    
    console.log('✅ Elemento encontrado, imprimiendo...');
    
    try {
        // Capturar como imagen con alta calidad
        const canvas = await html2canvas(elemento, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: true,
            width: elemento.scrollWidth,
            height: elemento.scrollHeight,
            windowWidth: elemento.scrollWidth,
            windowHeight: elemento.scrollHeight
        });
        
        const imgData = canvas.toDataURL('image/png');
        const ventanaImpresion = window.open('', '_blank');
       
        if (!ventanaImpresion) {
            alert('Por favor permite las ventanas emergentes para imprimir');
            return;
        }
        
        ventanaImpresion.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Recibo - ${cliente.nombre} ${cliente.apellido}</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            background: white;
                        }
                        img {
                            width: 100%;
                            height: auto;
                            display: block;
                        }
                        @media print {
                            body {
                                margin: 0;
                                padding: 0;
                            }
                            img {
                                width: 100%;
                                height: auto;
                                page-break-inside: avoid;
                            }
                        }
                        @page {
                            size: A4;
                            margin: 0;
                        }
                    </style>
                </head>
                <body>
                    <img src="${imgData}" onload="setTimeout(() => { window.print(); }, 500);" />
                </body>
            </html>
        `);
        
        ventanaImpresion.document.close();
        console.log('✅ Ventana de impresión abierta');
    } catch (error) {
        console.error('❌ Error imprimiendo:', error);
        alert('Error al imprimir: ' + error.message);
    }
};
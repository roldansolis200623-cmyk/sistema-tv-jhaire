const ClienteModel = require('../models/clienteModel');
const pdfService = require('../services/pdfService');

const reportePdfController = {
    /**
     * Reporte general de todos los clientes
     */
    reporteGeneral: async (req, res) => {
        try {
            const clientes = await ClienteModel.getAll();
            const doc = await pdfService.generarReporteGeneral(clientes);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=reporte_general.pdf');

            doc.pipe(res);
            doc.end();
        } catch (error) {
            console.error('Error generando reporte general:', error);
            res.status(500).json({ error: 'Error generando reporte' });
        }
    },

    /**
     * Reporte de clientes deudores y morosos
     */
    reporteDeudores: async (req, res) => {
        try {
            const clientes = await ClienteModel.getAll();
            const doc = await pdfService.generarReporteDeudores(clientes);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=reporte_deudores.pdf');

            doc.pipe(res);
            doc.end();
        } catch (error) {
            console.error('Error generando reporte de deudores:', error);
            res.status(500).json({ error: 'Error generando reporte' });
        }
    },

    /**
     * Reporte filtrado por tipo de servicio
     */
    reportePorServicio: async (req, res) => {
        try {
            const { tipo } = req.params; // Solo Internet, Solo Cable, Dúo
            const clientes = await ClienteModel.getAll();
            const doc = await pdfService.generarReportePorServicio(clientes, tipo);

            const filename = `reporte_${tipo.toLowerCase().replace(/ /g, '_')}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

            doc.pipe(res);
            doc.end();
        } catch (error) {
            console.error('Error generando reporte por servicio:', error);
            res.status(500).json({ error: 'Error generando reporte' });
        }
    },

    /**
     * Reporte filtrado por tipo de señal
     */
    reportePorSenal: async (req, res) => {
        try {
            const { tipo } = req.params; // Analógica, Digital, Mixta
            const clientes = await ClienteModel.getAll();
            const doc = await pdfService.generarReportePorSenal(clientes, tipo);

            const filename = `reporte_senal_${tipo.toLowerCase()}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

            doc.pipe(res);
            doc.end();
        } catch (error) {
            console.error('Error generando reporte por señal:', error);
            res.status(500).json({ error: 'Error generando reporte' });
        }
    }
};

module.exports = reportePdfController;
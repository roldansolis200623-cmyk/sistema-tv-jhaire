const express = require('express');
const router = express.Router();
const reportePdfController = require('../controllers/reportePdfController');
const authMiddleware = require('../middlewares/authMiddleware');

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Reporte general
router.get('/pdf/general', reportePdfController.reporteGeneral);

// Reporte de deudores
router.get('/pdf/deudores', reportePdfController.reporteDeudores);

// Reporte por tipo de servicio
router.get('/pdf/servicio/:tipo', reportePdfController.reportePorServicio);

// Reporte por tipo de señal
router.get('/pdf/senal/:tipo', reportePdfController.reportePorSenal);

module.exports = router;
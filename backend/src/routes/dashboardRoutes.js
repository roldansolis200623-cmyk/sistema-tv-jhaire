// ============================================
// backend/src/routes/dashboardRoutes.js
// ============================================

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

// Proteger todas las rutas
router.use(authMiddleware);

// KPIs principales
router.get('/kpis', dashboardController.getKPIs);
router.get('/ingresos-mensuales', dashboardController.getIngresosMensuales);
router.get('/mejores-pagadores', dashboardController.getTop10MejoresPagadores);
router.get('/peores-pagadores', dashboardController.getTop10PeoresPagadores);
router.get('/distribucion-estado', dashboardController.getDistribucionEstado);
router.get('/distribucion-geografica', dashboardController.getDistribucionGeografica);
router.get('/tasa-morosidad', dashboardController.getTasaMorosidad);
router.get('/nuevos-clientes', dashboardController.getNuevosClientesMes);
router.get('/proyeccion-ingresos', dashboardController.getProyeccionIngresos);
router.get('/clientes-riesgo', dashboardController.getClientesRiesgo);
router.get('/resumen', dashboardController.getResumenCompleto);

module.exports = router;
// ============================================
// backend/src/routes/dashboardRoutes.js
// ============================================

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Proteger todas las rutas con autenticación
router.use(verificarToken);

// KPIs principales
router.get('/kpis', dashboardController.getKPIs);

// Ingresos mensuales
router.get('/ingresos-mensuales', dashboardController.getIngresosMensuales);

// Top pagadores
router.get('/mejores-pagadores', dashboardController.getTop10MejoresPagadores);
router.get('/peores-pagadores', dashboardController.getTop10PeoresPagadores);

// Distribuciones
router.get('/distribucion-estado', dashboardController.getDistribucionEstado);
router.get('/distribucion-geografica', dashboardController.getDistribucionGeografica);

// Métricas temporales
router.get('/tasa-morosidad', dashboardController.getTasaMorosidad);
router.get('/nuevos-clientes', dashboardController.getNuevosClientesMes);

// Proyecciones y riesgos
router.get('/proyeccion-ingresos', dashboardController.getProyeccionIngresos);
router.get('/clientes-riesgo', dashboardController.getClientesRiesgo);

// Resumen completo
router.get('/resumen', dashboardController.getResumenCompleto);

module.exports = router;
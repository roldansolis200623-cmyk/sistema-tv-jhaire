// ============================================
// backend/src/routes/cronRoutes.js
// ============================================

const express = require('express');
const router = express.Router();
const cronController = require('../controllers/cronController');
const authMiddleware = require('../middlewares/authMiddleware');

// Proteger todas las rutas
router.use(authMiddleware);

// Ejecutar tarea manualmente
router.post('/ejecutar/:tarea', cronController.ejecutarTarea);

// Logs
router.get('/logs', cronController.getLogs);
router.get('/estadisticas', cronController.getEstadisticas);
router.delete('/logs/limpiar', cronController.limpiarLogs);

// Configuración
router.get('/configuracion', cronController.getConfiguracion);
router.put('/configuracion', cronController.actualizarConfiguracion);

module.exports = router;
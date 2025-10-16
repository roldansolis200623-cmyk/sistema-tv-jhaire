const express = require('express');
const router = express.Router();
const incidenciaController = require('../controllers/incidenciaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas principales
router.get('/', incidenciaController.getAll);
router.get('/hoy', incidenciaController.getHoy);
router.get('/estadisticas', incidenciaController.getEstadisticas);
router.get('/cliente/:clienteId', incidenciaController.getByCliente);
router.get('/:id', incidenciaController.getById);
router.post('/', incidenciaController.create);
router.put('/:id', incidenciaController.update);
router.delete('/:id', incidenciaController.delete);

// Acciones específicas
router.post('/:id/iniciar', incidenciaController.iniciarAtencion);
router.post('/:id/resolver', incidenciaController.resolver);
router.post('/:id/cancelar', incidenciaController.cancelar);

module.exports = router;
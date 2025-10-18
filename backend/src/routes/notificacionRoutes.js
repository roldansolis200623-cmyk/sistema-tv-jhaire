const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ✅ RUTAS ESPECÍFICAS PRIMERO (antes de /:id)
router.get('/no-leidas', notificacionController.getNoLeidas);
router.get('/contador', notificacionController.getContador);
router.patch('/leer-todas', notificacionController.marcarTodasComoLeidas);
router.delete('/limpiar-antiguas', notificacionController.limpiarAntiguas);
router.get('/cliente/:id', notificacionController.getPorCliente);

// ✅ RUTAS GENERALES
router.get('/', notificacionController.getAll);
router.post('/', notificacionController.crear);

// ✅ RUTAS CON :id AL FINAL
router.patch('/:id/leer', notificacionController.marcarComoLeida);
router.delete('/:id', notificacionController.eliminar);

module.exports = router;
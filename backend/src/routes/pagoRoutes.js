const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');

// ✅ ENDPOINTS ESPECÍFICOS PRIMERO (sin parámetros dinámicos)
router.get('/estadisticas', pagoController.getEstadisticas);
router.get('/rango', pagoController.getPorRangoFechas);
router.post('/recalcular-deudas', pagoController.recalcularDeudas);

// ✅ ENDPOINTS GENÉRICOS DESPUÉS (con parámetros dinámicos)
router.get('/', pagoController.getAll);
router.post('/', pagoController.crear);
router.get('/cliente/:clienteId', pagoController.getPorCliente);
router.delete('/:id', pagoController.eliminar);

module.exports = router;
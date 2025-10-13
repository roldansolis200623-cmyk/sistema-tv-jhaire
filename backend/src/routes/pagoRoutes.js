const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');

// Obtener todos los pagos
router.get('/', pagoController.getAll);

// Obtener estadísticas de pagos
router.get('/estadisticas', pagoController.getEstadisticas);

// 🆕 Recalcular todas las deudas (endpoint nuevo)
router.post('/recalcular-deudas', pagoController.recalcularDeudas);

// Obtener pagos por rango de fechas
router.get('/rango', pagoController.getPorRangoFechas);

// Obtener pagos de un cliente específico
router.get('/cliente/:clienteId', pagoController.getPorCliente);

// Registrar nuevo pago
router.post('/', pagoController.crear);

// Eliminar pago
router.delete('/:id', pagoController.eliminar);

module.exports = router;
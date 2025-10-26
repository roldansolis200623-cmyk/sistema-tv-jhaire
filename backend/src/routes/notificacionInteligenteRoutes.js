const express = require('express');
const router = express.Router();
const notificacionInteligenteController = require('../controllers/notificacionInteligenteController');
const authMiddleware = require('../middlewares/authMiddleware');

// ✅ Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/notificaciones-inteligentes - Obtener todas con filtros
router.get('/', notificacionInteligenteController.obtenerTodas);

// GET /api/notificaciones-inteligentes/resumen - Contadores/resumen
router.get('/resumen', notificacionInteligenteController.obtenerResumen);

// GET /api/notificaciones-inteligentes/estadisticas - Estadísticas detalladas
router.get('/estadisticas', notificacionInteligenteController.obtenerEstadisticas);

// GET /api/notificaciones-inteligentes/clientes-irregulares - Clientes con patrones irregulares
router.get('/clientes-irregulares', notificacionInteligenteController.obtenerClientesIrregulares);

// GET /api/notificaciones-inteligentes/cliente/:clienteId - Notificaciones de un cliente
router.get('/cliente/:clienteId', notificacionInteligenteController.obtenerPorCliente);

// GET /api/notificaciones-inteligentes/patron/:clienteId - Calcular patrón de un cliente
router.get('/patron/:clienteId', notificacionInteligenteController.calcularPatron);

// POST /api/notificaciones-inteligentes/generar - Generar notificaciones
router.post('/generar', notificacionInteligenteController.generar);

// PATCH /api/notificaciones-inteligentes/:id/leida - Marcar como leída
router.patch('/:id/leida', notificacionInteligenteController.marcarLeida);

// PATCH /api/notificaciones-inteligentes/leer-varias - Marcar varias como leídas
router.patch('/leer-varias', notificacionInteligenteController.marcarVariasLeidas);

// DELETE /api/notificaciones-inteligentes/:id/archivar - Archivar notificación
router.delete('/:id/archivar', notificacionInteligenteController.archivar);

// PUT /api/notificaciones-inteligentes/cliente/:clienteId/modalidad - Actualizar modalidad de pago
router.put('/cliente/:clienteId/modalidad', notificacionInteligenteController.actualizarModalidad);

// DELETE /api/notificaciones-inteligentes/limpiar - Limpiar notificaciones antiguas
router.delete('/limpiar', notificacionInteligenteController.limpiar);

module.exports = router;
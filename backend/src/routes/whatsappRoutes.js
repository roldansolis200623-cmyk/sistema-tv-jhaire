const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/recordatorio/:clienteId', authMiddleware, whatsappController.enviarRecordatorioIndividual);
router.post('/recordatorio-deudores', authMiddleware, whatsappController.enviarRecordatorioDeudores);
router.post('/mensaje-personalizado', authMiddleware, whatsappController.enviarMensajePersonalizado);

module.exports = router;
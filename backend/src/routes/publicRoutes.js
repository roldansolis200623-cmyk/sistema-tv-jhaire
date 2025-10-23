const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const rateLimit = require('express-rate-limit');

// Rate limiting: 10 consultas por minuto por IP
const consultaLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10,
    message: { 
        success: false, 
        error: 'Demasiadas consultas. Intenta en 1 minuto.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 🔍 Consultar deuda (pública, sin autenticación)
router.post('/consultar-deuda', consultaLimiter, publicController.consultarDeuda);

// 📱 Métodos de pago (pública)
router.get('/metodos-pago', publicController.obtenerMetodosPago);

module.exports = router;
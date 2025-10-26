const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middlewares/authMiddleware');

// ✅ CORREGIDO: Rate limiting más estricto para consultas públicas
const consultaLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 consultas por IP cada 15 minutos
    message: { 
        success: false, 
        error: 'Demasiadas consultas. Por favor, intenta nuevamente en 15 minutos.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
    // ✅ Personalizar mensaje según límite alcanzado
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Has excedido el límite de consultas permitidas.',
            mensaje: 'Puedes consultar hasta 10 veces cada 15 minutos. Intenta más tarde.',
            retry_after: '15 minutos'
        });
    }
});

// ✅ Rate limiter general para otras rutas públicas
const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // 30 requests por minuto
    message: { 
        success: false, 
        error: 'Demasiadas solicitudes. Intenta en 1 minuto.' 
    }
});

// 🔍 Consultar deuda (pública, con rate limiting estricto)
router.post('/consultar-deuda', consultaLimiter, publicController.consultarDeuda);

// 📱 Métodos de pago (pública, rate limiting general)
router.get('/metodos-pago', generalLimiter, publicController.obtenerMetodosPago);

// 📊 Estadísticas de consultas (PROTEGIDA - solo admin)
router.get('/estadisticas-consultas', authMiddleware, publicController.obtenerEstadisticasConsultas);

module.exports = router;
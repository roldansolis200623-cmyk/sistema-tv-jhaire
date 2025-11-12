// ============================================
// backend/src/routes/authRoutes.js
// ✅ VERSIÓN CORREGIDA - SIN ERRORES
// ============================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/refresh-token
router.post('/refresh-token', authController.refreshToken);

// POST /api/auth/logout
router.post('/logout', authMiddleware, authController.logout);

// GET /api/auth/profile
router.get('/profile', authMiddleware, authController.getProfile);

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, authController.changePassword);

// GET /api/auth/verify-token (para testear)
router.get('/verify-token', authMiddleware, authController.verifyToken);

module.exports = router;
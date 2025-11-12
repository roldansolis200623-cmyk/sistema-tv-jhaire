// ============================================
// backend/src/app.js
// ✅ VERSIÓN MEJORADA CON SEGURIDAD Y VALIDACIONES
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);

// ============================================
// SEGURIDAD - HELMET
// ============================================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// ============================================
// COMPRESIÓN GZIP
// ============================================
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6
}));

// ============================================
// CORS CONFIGURADO
// ============================================
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:5173',
        'https://www.tvjhair.com',
        'https://tvjhair.com'
    ];

app.use(cors({
    origin: (origin, callback) => {
        // Permitir requests sin origin (apps móviles, Postman, etc)
        if (!origin) {
            return callback(null, true);
        }
        
        // Verificar si está en la lista permitida
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Permitir subdominios de Vercel
        if (origin.includes('.vercel.app')) {
            return callback(null, true);
        }
        
        // Bloquear otros origins
        callback(new Error('No permitido por CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400
}));

// ============================================
// BODY PARSERS
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// ✅ NUEVO: RATE LIMITING
// ============================================

// Rate limit general (100 requests por 15 minutos)
const limiterGeneral = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: 'Demasiadas solicitudes desde esta IP. Intenta más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'development'
});

// Rate limit para login (5 intentos por 15 minutos)
const limiterLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: 'Demasiados intentos de inicio de sesión. Intenta en 15 minutos.'
    },
    skipSuccessfulRequests: true,
    skip: (req) => process.env.NODE_ENV === 'development'
});

// Rate limit para API pública (10 requests por minuto)
const limiterPublic = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: 'Límite de solicitudes alcanzado'
    },
    skip: (req) => process.env.NODE_ENV === 'development'
});

app.use('/api/', limiterGeneral);
app.use('/api/auth/login', limiterLogin);
app.use('/api/public/', limiterPublic);

// ============================================
// LOGGING EN DESARROLLO
// ============================================
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// ============================================
// RUTAS DE PRUEBA
// ============================================
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 API Sistema TV Jhaire', 
        version: '2.0.0',
        status: 'online',
        timestamp: new Date().toISOString(),
        features: [
            'Dashboard Ejecutivo',
            'CRON Jobs Automatizados',
            'Portal Público Cliente',
            'Notificaciones Inteligentes',
            'Sistema Completo de Gestión',
            'Validación de Inputs',
            'Rate Limiting',
            'RBAC (Roles y Permisos)'
        ]
    });
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', async (req, res) => {
    try {
        const { healthCheck } = require('./config/database');
        const dbHealth = await healthCheck();
        
        res.json({
            status: dbHealth.healthy ? 'ok' : 'error',
            database: dbHealth,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ============================================
// IMPORTAR RUTAS EXISTENTES
// ============================================
const publicRoutes = require('./routes/publicRoutes');
const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const reportePdfRoutes = require('./routes/reportePdfRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const perfilInternetRoutes = require('./routes/perfilInternetRoutes');
const incidenciaRoutes = require('./routes/incidenciaRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');
const notificacionInteligenteRoutes = require('./routes/notificacionInteligenteRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const cronRoutes = require('./routes/cronRoutes');
const tareasRoutes = require('./routes/tareas');

// ============================================
// USAR RUTAS EXISTENTES
// ============================================
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/perfiles-internet', perfilInternetRoutes);
app.use('/api/incidencias', incidenciaRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/notificaciones-inteligentes', notificacionInteligenteRoutes);

// Rutas de reportes (orden importante)
app.use('/api/reportes', reportePdfRoutes);
app.use('/api/reportes', reporteRoutes);

// Rutas de Dashboard y CRON
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cron', cronRoutes);

// Rutas de tareas
app.use('/api/tareas', tareasRoutes);

// ============================================
// ✅ MANEJO DE RUTAS 404
// ============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        availableRoutes: [
            '/api/auth',
            '/api/clientes',
            '/api/pagos',
            '/api/dashboard',
            '/api/cron',
            '/api/tareas',
            '/health'
        ]
    });
});

// ============================================
// ✅ MANEJO DE ERRORES GLOBAL (MEJORADO)
// ============================================
app.use((err, req, res, next) => {
    // Log completo en servidor
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR:', err.message);
    console.error('📍 Ruta:', req.path);
    console.error('🔧 Método:', req.method);
    console.error('👤 Usuario:', req.user?.id || 'anónimo');
    
    if (process.env.NODE_ENV !== 'production') {
        console.error('📚 Stack:', err.stack);
    }
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Construir respuesta de error
    let errorResponse = {
        success: false,
        error: err.message || 'Error interno del servidor',
        timestamp: new Date().toISOString()
    };
    
    // Error de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            ...errorResponse,
            error: 'Error de validación',
            details: err.details
        });
    }
    
    // Error de BD (PostgreSQL)
    if (err.code && typeof err.code === 'string') {
        if (err.code.startsWith('23')) {
            // Constraint violation
            return res.status(400).json({
                ...errorResponse,
                error: 'Datos inválidos o duplicados'
            });
        }
        if (err.code === '42P01') {
            // Table not found
            return res.status(500).json({
                ...errorResponse,
                error: 'Error en base de datos'
            });
        }
    }
    
    // Error de CORS
    if (err.message === 'No permitido por CORS') {
        return res.status(403).json({
            ...errorResponse,
            error: 'Acceso CORS denegado'
        });
    }
    
    // Error de autenticación JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            ...errorResponse,
            error: 'Token inválido'
        });
    }
    
    // Error de token expirado
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            ...errorResponse,
            error: 'Token expirado'
        });
    }
    
    // Incluir stack solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        errorResponse.details = err;
    }
    
    // Determinar status code
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json(errorResponse);
});

module.exports = app;
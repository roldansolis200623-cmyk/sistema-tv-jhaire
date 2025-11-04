// ============================================
// backend/src/app.js
// CONFIGURACIÓN EXPRESS CON TODAS LAS RUTAS
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();

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
            'Sistema Completo de Gestión'
        ]
    });
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', async (req, res) => {
    const { healthCheck } = require('./config/database');
    const dbHealth = await healthCheck();
    
    res.json({
        status: dbHealth.healthy ? 'ok' : 'error',
        database: dbHealth,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
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

// ============================================
// ✅ NUEVO: IMPORTAR RUTAS DASHBOARD Y CRON
// ============================================
const dashboardRoutes = require('./routes/dashboardRoutes');
const cronRoutes = require('./routes/cronRoutes');

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

// ============================================
// ✅ NUEVO: USAR RUTAS DASHBOARD Y CRON
// ============================================
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cron', cronRoutes);

// ============================================
// MANEJO DE RUTAS 404
// ============================================
app.use((req, res) => {
    res.status(404).json({
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
            '/health'
        ]
    });
});

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================
app.use((err, req, res, next) => {
    // Log completo en servidor
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR:', err.message);
    console.error('📍 Ruta:', req.path);
    console.error('🔧 Método:', req.method);
    
    if (process.env.NODE_ENV !== 'production') {
        console.error('📚 Stack:', err.stack);
    }
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Respuesta al cliente
    const errorResponse = {
        error: err.message || 'Error interno del servidor',
        timestamp: new Date().toISOString()
    };
    
    // Solo incluir stack en desarrollo
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        errorResponse.path = req.path;
    }
    
    res.status(err.status || 500).json(errorResponse);
});

module.exports = app;
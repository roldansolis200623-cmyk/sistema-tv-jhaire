const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();

// ✅ NUEVO: Helmet para headers de seguridad
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
        maxAge: 31536000, // 1 año
        includeSubDomains: true,
        preload: true
    }
}));

// ✅ NUEVO: Compresión gzip para respuestas
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6 // Balance entre velocidad y compresión
}));

// ✅ MEJORADO: CORS configurado con soporte para Vercel
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
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔧 Origen recibido:', origin);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // ✅ Permitir requests sin origin (apps móviles, Postman, curl, etc)
        if (!origin) {
            console.log('✅ Request sin origin - Permitido');
            return callback(null, true);
        }
        
        // ✅ Verificar si está en la lista de origins permitidos
        if (allowedOrigins.includes(origin)) {
            console.log('✅ Origin en lista permitida:', origin);
            return callback(null, true);
        }
        
        // ✅ Permitir TODOS los subdominios de Vercel dinámicamente
        if (origin.includes('.vercel.app')) {
            console.log('✅ Origin de Vercel permitido:', origin);
            return callback(null, true);
        }
        
        // ❌ Bloquear cualquier otro origin
        console.warn('⚠️ Origin NO permitido:', origin);
        callback(new Error('No permitido por CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 horas
}));

app.use(express.json({ limit: '10mb' })); // ✅ Límite de tamaño
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ NUEVO: Logging de requests (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 API Sistema de Clientes', 
        version: '2.0.0',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// ✅ NUEVO: Health check endpoint
app.get('/health', async (req, res) => {
    const { healthCheck } = require('./config/database');
    const dbHealth = await healthCheck();
    
    res.json({
        status: dbHealth.healthy ? 'ok' : 'error',
        database: dbHealth,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Importar rutas
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
const notificacionInteligenteRoutes = require('./routes/notificacionInteligenteRoutes'); // ✅ NUEVO

// Usar rutas
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/perfiles-internet', perfilInternetRoutes);
app.use('/api/incidencias', incidenciaRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/notificaciones-inteligentes', notificacionInteligenteRoutes); // ✅ NUEVO

// Rutas de reportes - Orden importante
app.use('/api/reportes', reportePdfRoutes);
app.use('/api/reportes', reporteRoutes);

// ✅ NUEVO: Manejo de rutas 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// ✅ MEJORADO: Manejo de errores
app.use((err, req, res, next) => {
    // Log del error completo en servidor
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR:', err.message);
    console.error('📍 Ruta:', req.path);
    console.error('🔧 Método:', req.method);
    
    if (process.env.NODE_ENV !== 'production') {
        console.error('📚 Stack:', err.stack);
    }
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Respuesta al cliente (sin exponer detalles en producción)
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
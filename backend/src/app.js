const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'https://www.tvjhair.com',
    'https://tvjhair.com',
    'https://sistema-tv-jhaire.vercel.app',
    'https://sistema-tv-jhaire-tlmy.vercel.app',
    'https://sistema-tv-jhaire-tlmy-git-main-gabriels-projects-697bb8c5.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 API Sistema de Clientes', 
        version: '1.0.0',
        status: 'online' 
    });
});

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const reportePdfRoutes = require('./routes/reportePdfRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const perfilInternetRoutes = require('./routes/perfilInternetRoutes');
const incidenciaRoutes = require('./routes/incidenciaRoutes');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/perfiles-internet', perfilInternetRoutes);
app.use('/api/incidencias', incidenciaRoutes);

// ✅ RUTAS DE REPORTES - ORDEN IMPORTANTE
app.use('/api/reportes', reportePdfRoutes);  // PRIMERO los PDFs (tiene /pdf/ en sus rutas)
app.use('/api/reportes', reporteRoutes);     // DESPUÉS el Excel

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: err.message 
    });
});

module.exports = app;
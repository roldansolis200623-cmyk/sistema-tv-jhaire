const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
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
const perfilInternetRoutes = require('./routes/perfilInternetRoutes'); // AGREGAR ESTA LÍNEA

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/reportes', reportePdfRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/perfiles-internet', perfilInternetRoutes); // AGREGAR ESTA LÍNEA

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: err.message 
    });
});

module.exports = app;
require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/config/database');
const ClienteModel = require('./src/models/clienteModel');
const PagoModel = require('./src/models/pagoModel');
const PerfilInternetModel = require('./src/models/perfilInternetModel');
const UsuarioModel = require('./src/models/usuarioModel');
const NotificacionModel = require('./src/models/NotificacionModel');
const cronService = require('./src/services/cronService');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // IMPORTANTE: Railway necesita esto

const inicializarBD = async () => {
    try {
        console.log('🔄 Verificando conexión a la base de datos...');
        await pool.query('SELECT NOW()');
        console.log('✅ Conexión exitosa a PostgreSQL');
        
        console.log('📝 Creando/verificando tablas...');
        await ClienteModel.crearTabla();
        await PagoModel.crearTabla();
        await PerfilInternetModel.crearTabla();
        await UsuarioModel.crearTabla();
        await NotificacionModel.crearTabla();
        console.log('✅ Tablas verificadas correctamente');
    } catch (error) {
        console.error('❌ Error en la base de datos:', error);
        process.exit(1);
    }
};

const iniciarServidor = async () => {
    try {
        await inicializarBD();
        cronService.iniciar();
        
        app.listen(PORT, HOST, () => {
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
            console.log(`📊 Base de datos: ${process.env.PGDATABASE || 'local'}`);
            console.log(`⏰ Iniciado: ${new Date().toLocaleString()}`);
        });
    } catch (error) {
        console.error('❌ Error iniciando el servidor:', error);
        process.exit(1);
    }
};

iniciarServidor();
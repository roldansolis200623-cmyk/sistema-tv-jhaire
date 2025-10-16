require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/config/database');
const ClienteModel = require('./src/models/clienteModel');
const PagoModel = require('./src/models/pagoModel');
const PerfilInternetModel = require('./src/models/perfilInternetModel'); // AGREGAR
const UsuarioModel = require('./src/models/usuarioModel');
const cronService = require('./src/services/cronService');

const PORT = process.env.PORT || 5000;

const inicializarBD = async () => {
    try {
        console.log('🔄 Verificando conexión a la base de datos...');
        await pool.query('SELECT NOW()');
        console.log('✅ Conexión exitosa a PostgreSQL');
        console.log('📝 Creando/verificando tablas...');
        await ClienteModel.crearTabla();
        await PagoModel.crearTabla();
        await PerfilInternetModel.crearTabla(); // AGREGAR
        await UsuarioModel.crearTabla();
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
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
            console.log(`⏰ Iniciado: ${new Date().toLocaleString()}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });
    } catch (error) {
        console.error('❌ Error iniciando el servidor:', error);
        process.exit(1);
    }
};

iniciarServidor();
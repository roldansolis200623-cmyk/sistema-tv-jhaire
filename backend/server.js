require('dotenv').config();

// ✅ VALIDACIÓN CRÍTICA: Verificar variables de entorno requeridas al inicio
const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ ERROR CRÍTICO: Variables de entorno faltantes:');
    missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
    });
    console.error('\n💡 Verifica tu archivo .env');
    process.exit(1);
}

// ✅ Validar longitud mínima de JWT_SECRET
if (process.env.JWT_SECRET.length < 32) {
    console.error('❌ ERROR: JWT_SECRET debe tener al menos 32 caracteres');
    console.error('💡 Genera uno seguro con: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
}

const app = require('./src/app');
const pool = require('./src/config/database');
const ClienteModel = require('./src/models/clienteModel');
const PagoModel = require('./src/models/pagoModel');
const PerfilInternetModel = require('./src/models/perfilInternetModel');
const UsuarioModel = require('./src/models/usuarioModel');
const NotificacionModel = require('./src/models/NotificacionModel');
const LogConsultaModel = require('./src/models/logConsultaModel');
const cronService = require('./src/services/cronService');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

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
        await LogConsultaModel.crearTabla();
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
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🚀 Servidor corriendo en puerto', PORT);
            console.log('📊 Base de datos:', process.env.PGDATABASE || process.env.DB_NAME);
            console.log('🔐 JWT configurado correctamente');
            console.log('⏰ Iniciado:', new Date().toLocaleString());
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });
    } catch (error) {
        console.error('❌ Error iniciando el servidor:', error);
        process.exit(1);
    }
};

// ✅ Manejo de señales de terminación
process.on('SIGTERM', () => {
    console.log('⚠️ SIGTERM recibido, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('⚠️ SIGINT recibido, cerrando servidor...');
    process.exit(0);
});

iniciarServidor();
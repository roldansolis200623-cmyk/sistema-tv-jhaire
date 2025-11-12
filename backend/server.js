// ============================================
// backend/server.js (o backend/src/server.js)
// SERVIDOR PRINCIPAL CON CRON JOBS SEGUROS
// ============================================

const app = require('./src/app');
const pool = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// ============================================
// VERIFICAR CONEXIÓN A BASE DE DATOS
// ============================================
const verificarConexion = async () => {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Conectado a PostgreSQL');
        console.log('🕐 Hora del servidor DB:', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error.message);
        return false;
    }
};

// ============================================
// INICIAR SERVIDOR
// ============================================
const iniciarServidor = async () => {
    // Verificar conexión a BD
    const dbConectada = await verificarConexion();
    
    if (!dbConectada) {
        console.error('❌ No se pudo conectar a la base de datos');
        console.error('⚠️  El servidor continuará pero sin BD');
    }

    // Iniciar servidor HTTP
    app.listen(PORT, () => {
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🚀 SERVIDOR TV JHAIRE - INICIADO');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📡 Puerto: ${PORT}`);
        console.log(`🌍 URL: http://localhost:${PORT}`);
        console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');

        // ✅ NUEVO: Configurar y activar CRON jobs CON MANEJO DE ERRORES
        if (dbConectada) {
            try {
                console.log('⚙️  Configurando CRON jobs...');
                
                // ✅ Importar de forma segura
                try {
                    const { configurarCronJobs } = require('./src/services/cronService');
                    
                    // Verificar que sea una función
                    if (typeof configurarCronJobs === 'function') {
                        configurarCronJobs();
                        
                        console.log('');
                        console.log('✅ CRON jobs configurados y activos');
                        console.log('🕐 Timezone: America/Lima (UTC-5)');
                        console.log('');
                        console.log('📋 Tareas programadas:');
                        console.log('   • Incremento deuda mensual: 1er día a las 00:00');
                        console.log('   • Suspensión automática: Diario a las 02:00');
                        console.log('   • Reactivación automática: Diario a las 03:00');
                        console.log('   • Actualizar scores: Diario a las 04:00');
                        console.log('   • Métricas diarias: Diario a las 23:55');
                        console.log('   • Refresh dashboard: Cada hora');
                        console.log('   • Backup automático: Diario a las 05:00');
                        console.log('');
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        console.log('✅ SISTEMA COMPLETAMENTE OPERATIVO');
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        console.log('');
                    } else {
                        throw new Error('configurarCronJobs no es una función');
                    }
                } catch (cronError) {
                    console.warn('');
                    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.warn('⚠️  CRON jobs no disponibles');
                    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.warn('Razón:', cronError.message);
                    console.warn('✅ El servidor funcionará sin automatización');
                    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.warn('');
                }
            } catch (error) {
                console.error('');
                console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.error('❌ ERROR AL CONFIGURAR CRON JOBS');
                console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.error('Error:', error.message);
                console.error('⚠️  El servidor funcionará sin automatización');
                console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.error('');
            }
        } else {
            console.warn('⚠️  CRON jobs NO activados (sin conexión a BD)');
            console.warn('');
        }
    });
};

// ============================================
// MANEJO DE ERRORES NO CAPTURADOS
// ============================================
process.on('unhandledRejection', (reason, promise) => {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ UNHANDLED REJECTION');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Promesa:', promise);
    console.error('Razón:', reason);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
});

process.on('uncaughtException', (error) => {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ UNCAUGHT EXCEPTION');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
    process.exit(1);
});

// ============================================
// MANEJO DE CIERRE GRACEFUL
// ============================================
process.on('SIGTERM', async () => {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  SIGTERM recibido, cerrando servidor...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Cerrar conexión a BD
    await pool.end();
    console.log('✅ Conexión a BD cerrada');
    
    console.log('✅ Servidor cerrado correctamente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    process.exit(0);
});

// ============================================
// INICIAR
// ============================================
iniciarServidor();
const { Pool } = require('pg');

// ✅ CORREGIDO: Configuración completa con timeouts y límites
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
    // ✅ Configuraciones de producción
    max: 20, // Máximo de conexiones en el pool
    idleTimeoutMillis: 30000, // Cerrar conexiones idle después de 30s
    connectionTimeoutMillis: 2000, // Timeout de conexión: 2s
    
    // ✅ SSL para producción (Railway, Heroku, etc.)
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    
    // ✅ Configuración de statement timeout (prevenir queries largas)
    statement_timeout: 30000, // 30 segundos máximo por query
});

// ✅ Manejo de errores del pool
pool.on('error', (err, client) => {
    console.error('❌ Error inesperado en conexión idle del pool:', err);
    // No hacer exit aquí, dejar que el proceso maneje el error
});

// ✅ Evento de conexión exitosa
pool.on('connect', (client) => {
    console.log('🔗 Nueva conexión establecida con la base de datos');
});

// ✅ Evento de remoción de cliente
pool.on('remove', (client) => {
    console.log('🔌 Conexión removida del pool');
});

// Probar la conexión al inicio
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.stack);
        // No hacer exit aquí, dejar que server.js lo maneje
    } else {
        console.log('✅ Conexión exitosa a PostgreSQL');
        console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
        console.log(`🖥️  Host: ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}`);
        release();
    }
});

// ✅ NUEVO: Función helper para ejecutar queries con retry
const queryWithRetry = async (query, params, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await pool.query(query, params);
        } catch (error) {
            console.error(`❌ Error en query (intento ${i + 1}/${retries}):`, error.message);
            
            if (i === retries - 1) throw error; // Último intento
            
            // Esperar antes de reintentar (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
};

// ✅ NUEVO: Función para verificar salud de la conexión
const healthCheck = async () => {
    try {
        const result = await pool.query('SELECT NOW(), current_database(), version()');
        return {
            healthy: true,
            timestamp: result.rows[0].now,
            database: result.rows[0].current_database,
            version: result.rows[0].version.split(' ')[1]
        };
    } catch (error) {
        return {
            healthy: false,
            error: error.message
        };
    }
};

// ✅ Graceful shutdown
const closePool = async () => {
    try {
        console.log('🔄 Cerrando pool de conexiones...');
        await pool.end();
        console.log('✅ Pool cerrado correctamente');
    } catch (error) {
        console.error('❌ Error cerrando pool:', error);
    }
};

// ✅ Manejar cierre limpio
process.on('SIGTERM', closePool);
process.on('SIGINT', closePool);

module.exports = pool;
module.exports.queryWithRetry = queryWithRetry;
module.exports.healthCheck = healthCheck;
module.exports.closePool = closePool;
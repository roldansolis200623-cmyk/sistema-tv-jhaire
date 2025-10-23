const pool = require('../config/database');

class LogConsultaModel {
    static async crearTabla() {
        const query = `
            CREATE TABLE IF NOT EXISTS logs_consultas (
                id SERIAL PRIMARY KEY,
                dni VARCHAR(15),
                ip_address VARCHAR(45),
                user_agent TEXT,
                resultado VARCHAR(20),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_logs_dni ON logs_consultas(dni);
            CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs_consultas(timestamp);
            CREATE INDEX IF NOT EXISTS idx_logs_resultado ON logs_consultas(resultado);
        `;

        try {
            await pool.query(query);
            console.log('✅ Tabla logs_consultas verificada/creada');
        } catch (error) {
            console.error('Error creando tabla logs_consultas:', error);
            throw error;
        }
    }
}

module.exports = LogConsultaModel;
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class UsuarioModel {
    static async crearTabla() {
        const query = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                nombre VARCHAR(100) NOT NULL,
                rol VARCHAR(20) DEFAULT 'admin',
                activo BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        await pool.query(query);
        
        // Crear usuario admin por defecto
        const adminExists = await pool.query(
            'SELECT * FROM usuarios WHERE username = $1',
            ['admin']
        );
        
        if (adminExists.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query(
                `INSERT INTO usuarios (username, password, nombre, rol) 
                 VALUES ($1, $2, $3, $4)`,
                ['admin', hashedPassword, 'Administrador', 'admin']
            );
            console.log('✅ Usuario admin creado (usuario: admin, contraseña: admin123)');
        }
    }

    static async findByUsername(username) {
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE username = $1 AND activo = true',
            [username]
        );
        return result.rows[0];
    }
}

module.exports = UsuarioModel;
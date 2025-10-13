const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    // Login
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            // Buscar usuario por EMAIL (no username)
            const query = 'SELECT * FROM usuarios WHERE username = $1';
            const result = await pool.query(query, [username]);
            

            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
            }

            const user = result.rows[0];

            // Comparar contraseña con bcrypt
            const passwordValido = await bcrypt.compare(password, user.password);
            
            if (password !== user.password) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
}

            // Generar token
            const token = jwt.sign(
                { id: user.id, email: user.email, rol: user.rol },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login exitoso',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    nombre_completo: user.nombre_completo,
                    rol: user.rol
                }
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    // Registro de nuevo usuario
    register: async (req, res) => {
        try {
            const { username, password, nombre_completo, rol } = req.body;

            // Verificar si el usuario ya existe
            const checkQuery = 'SELECT * FROM usuarios WHERE email = $1';
            const checkResult = await pool.query(checkQuery, [username]);

            if (checkResult.rows.length > 0) {
                return res.status(400).json({ error: 'El usuario ya existe' });
            }

            // Hashear contraseña
            const passwordHash = await bcrypt.hash(password, 10);

            // Insertar nuevo usuario
            const query = `
                INSERT INTO usuarios (email, password, nombre_completo, rol)
                VALUES ($1, $2, $3, $4)
                RETURNING id, email, nombre_completo, rol
            `;
            const result = await pool.query(query, [username, passwordHash, nombre_completo, rol || 'admin']);

            res.status(201).json({
                message: 'Usuario creado exitosamente',
                user: result.rows[0]
            });
        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    }
};

module.exports = authController;
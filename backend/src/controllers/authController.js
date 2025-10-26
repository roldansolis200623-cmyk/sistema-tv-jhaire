const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    // Login
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            // ✅ MEJORADO: Validaciones de entrada
            if (!username || !password) {
                return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
            }

            if (typeof username !== 'string' || typeof password !== 'string') {
                return res.status(400).json({ error: 'Datos inválidos' });
            }

            // Buscar usuario
            const query = 'SELECT * FROM usuarios WHERE username = $1';
            const result = await pool.query(query, [username]);
            
            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
            }

            const user = result.rows[0];

            // Comparar contraseña con bcrypt
            const passwordValido = await bcrypt.compare(password, user.password);
            
            if (!passwordValido) {
                return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
            }

            // Generar token
            const token = jwt.sign(
                { id: user.id, username: user.username, rol: user.rol },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login exitoso',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    nombre: user.nombre,
                    rol: user.rol
                }
            });
        } catch (error) {
            console.error('Error en login:', error.message);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    // Registro de nuevo usuario
    register: async (req, res) => {
        try {
            const { username, password, nombre, rol } = req.body;

            // ✅ CORREGIDO: Validaciones exhaustivas
            
            // Validar campos requeridos
            if (!username || !password || !nombre) {
                return res.status(400).json({ 
                    error: 'Todos los campos son requeridos: username, password, nombre' 
                });
            }

            // Validar tipos
            if (typeof username !== 'string' || typeof password !== 'string' || typeof nombre !== 'string') {
                return res.status(400).json({ error: 'Tipo de datos inválido' });
            }

            // ✅ Validar longitud de username
            if (username.length < 3 || username.length > 50) {
                return res.status(400).json({ 
                    error: 'El usuario debe tener entre 3 y 50 caracteres' 
                });
            }

            // ✅ Validar formato de username (solo letras, números, guión bajo)
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                return res.status(400).json({ 
                    error: 'El usuario solo puede contener letras, números y guión bajo (_)' 
                });
            }

            // ✅ Validar longitud de contraseña
            if (password.length < 8) {
                return res.status(400).json({ 
                    error: 'La contraseña debe tener al menos 8 caracteres' 
                });
            }

            // ✅ Validar complejidad de contraseña
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumber = /[0-9]/.test(password);

            if (!hasUpperCase || !hasLowerCase || !hasNumber) {
                return res.status(400).json({ 
                    error: 'La contraseña debe contener al menos: una mayúscula, una minúscula y un número' 
                });
            }

            // ✅ Validar nombre
            if (nombre.length < 2 || nombre.length > 100) {
                return res.status(400).json({ 
                    error: 'El nombre debe tener entre 2 y 100 caracteres' 
                });
            }

            // ✅ Validar rol permitido
            const rolesPermitidos = ['admin', 'operador'];
            const rolFinal = rol || 'admin';
            
            if (!rolesPermitidos.includes(rolFinal)) {
                return res.status(400).json({ 
                    error: 'Rol inválido. Roles permitidos: admin, operador' 
                });
            }

            // Verificar si el usuario ya existe
            const checkQuery = 'SELECT * FROM usuarios WHERE username = $1';
            const checkResult = await pool.query(checkQuery, [username]);

            if (checkResult.rows.length > 0) {
                return res.status(400).json({ error: 'El usuario ya existe' });
            }

            // Hashear contraseña con salt de 10 rondas
            const passwordHash = await bcrypt.hash(password, 10);

            // Insertar nuevo usuario
            const query = `
                INSERT INTO usuarios (username, password, nombre, rol)
                VALUES ($1, $2, $3, $4)
                RETURNING id, username, nombre, rol, created_at
            `;
            const result = await pool.query(query, [username, passwordHash, nombre, rolFinal]);

            res.status(201).json({
                message: 'Usuario creado exitosamente',
                user: result.rows[0]
            });
        } catch (error) {
            console.error('Error en registro:', error.message);
            
            // ✅ Manejar error de duplicado de PostgreSQL
            if (error.code === '23505') {
                return res.status(400).json({ error: 'El usuario ya existe' });
            }
            
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    // ✅ NUEVO: Cambiar contraseña
    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id; // Del middleware de auth

            // Validaciones
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ 
                    error: 'Contraseña actual y nueva son requeridas' 
                });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({ 
                    error: 'La nueva contraseña debe tener al menos 8 caracteres' 
                });
            }

            // Validar complejidad
            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
                return res.status(400).json({ 
                    error: 'La contraseña debe contener mayúsculas, minúsculas y números' 
                });
            }

            // Obtener usuario
            const userQuery = 'SELECT * FROM usuarios WHERE id = $1';
            const userResult = await pool.query(userQuery, [userId]);

            if (userResult.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            const user = userResult.rows[0];

            // Verificar contraseña actual
            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                return res.status(401).json({ error: 'Contraseña actual incorrecta' });
            }

            // Hashear nueva contraseña
            const newPasswordHash = await bcrypt.hash(newPassword, 10);

            // Actualizar contraseña
            const updateQuery = `
                UPDATE usuarios 
                SET password = $1, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $2
            `;
            await pool.query(updateQuery, [newPasswordHash, userId]);

            res.json({ message: 'Contraseña actualizada exitosamente' });

        } catch (error) {
            console.error('Error en changePassword:', error.message);
            res.status(500).json({ error: 'Error al cambiar contraseña' });
        }
    }
};

module.exports = authController;
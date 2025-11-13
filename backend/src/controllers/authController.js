// ============================================
// backend/src/controllers/authController.js
// ✅ FIX: Retorna "user" en lugar de "usuario"
// ============================================

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// ============================================
// GENERAR TOKENS
// ============================================
const generateTokens = (userId, userRole = 'admin') => {
    const accessToken = jwt.sign(
        {
            userId,
            role: userRole,
            type: 'access'
        },
        process.env.JWT_SECRET || 'tu-secret-key',
        {
            expiresIn: '1h',
            issuer: 'tvjhaire-api',
            audience: 'tvjhaire-frontend'
        }
    );

    const refreshToken = jwt.sign(
        {
            userId,
            role: userRole,
            type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET || 'tu-refresh-secret-key',
        {
            expiresIn: '7d',
            issuer: 'tvjhaire-api'
        }
    );

    return { accessToken, refreshToken };
};

// ============================================
// LOGIN
// ============================================
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Usuario y contraseña requeridos'
            });
        }

        // Buscar usuario
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Usuario o contraseña incorrectos'
            });
        }

        const userData = result.rows[0];

        // Validar contraseña
        const passwordMatch = await bcrypt.compare(password, userData.password);
        
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Usuario o contraseña incorrectos'
            });
        }

        // Generar tokens
        const { accessToken, refreshToken } = generateTokens(userData.id, userData.rol);

        // Retornar con "user" (NO "usuario")
        res.json({
            success: true,
            message: 'Sesión iniciada correctamente',
            accessToken,
            refreshToken,
            user: {
                id: userData.id,
                username: userData.username,
                nombre: userData.nombre,
                rol: userData.rol
            }
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor'
        });
    }
};

// ============================================
// REFRESH TOKEN
// ============================================
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token requerido'
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'tu-refresh-secret-key');
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Refresh token expirado'
                });
            }
            return res.status(401).json({
                success: false,
                error: 'Refresh token inválido'
            });
        }

        const userResult = await pool.query(
            'SELECT * FROM usuarios WHERE id = $1',
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        const userData = userResult.rows[0];
        const { accessToken: newAccessToken } = generateTokens(userData.id, userData.rol);

        res.json({
            success: true,
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error('❌ Error refrescando token:', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor'
        });
    }
};

// ============================================
// LOGOUT
// ============================================
const logout = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Sesión cerrada correctamente'
        });
    } catch (error) {
        console.error('❌ Error en logout:', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor'
        });
    }
};

// ============================================
// VERIFY TOKEN
// ============================================
const verifyToken = (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token no proporcionado'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-secret-key');

        res.json({
            success: true,
            message: 'Token válido',
            decoded
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expirado'
            });
        }

        res.status(401).json({
            success: false,
            error: 'Token inválido'
        });
    }
};

// ============================================
// GET PROFILE
// ============================================
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado'
            });
        }

        const result = await pool.query(
            'SELECT id, username, nombre, rol, created_at, updated_at FROM usuarios WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error en getProfile:', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor'
        });
    }
};

// ============================================
// CHANGE PASSWORD
// ============================================
const changePassword = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { passwordActual, passwordNueva } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado'
            });
        }

        if (!passwordActual || !passwordNueva) {
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son requeridos'
            });
        }

        if (passwordNueva.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        const result = await pool.query(
            'SELECT * FROM usuarios WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        const userData = result.rows[0];

        const passwordMatch = await bcrypt.compare(passwordActual, userData.password);
        
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Contraseña actual incorrecta'
            });
        }

        const passwordNuevaHash = await bcrypt.hash(passwordNueva, 10);

        await pool.query(
            'UPDATE usuarios SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [passwordNuevaHash, userId]
        );

        res.json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        console.error('❌ Error en changePassword:', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor'
        });
    }
};

// ============================================
// EXPORTAR
// ============================================
module.exports = {
    login,
    logout,
    refreshToken,
    verifyToken,
    getProfile,
    changePassword,
    generateTokens
};
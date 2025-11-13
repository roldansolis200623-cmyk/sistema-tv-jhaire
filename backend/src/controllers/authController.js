const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// ============================================
// GENERAR TOKENS (ACCESS + REFRESH)
// ============================================
const generateTokens = (userId, userRole = 'admin') => {
    // Access token: válido por 1 hora
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

    // Refresh token: válido por 7 días
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

        // ✅ Validar inputs
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Usuario y contraseña requeridos'
            });
        }

        // Buscar usuario por USERNAME
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

        const usuario = result.rows[0];

        // ✅ Validar contraseña con bcrypt
        const passwordMatch = await bcrypt.compare(password, usuario.password);
        
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Usuario o contraseña incorrectos'
            });
        }

        // ✅ Generar tokens
        const { accessToken, refreshToken } = generateTokens(usuario.id, usuario.rol);

        // ✅ Guardar refresh token en BD
        await pool.query(
            `UPDATE usuarios SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [usuario.id]
        );

        // ✅ Responder con tokens
        res.json({
            success: true,
            message: 'Sesión iniciada correctamente',
            accessToken,
            refreshToken,
            usuario: {
                id: usuario.id,
                username: usuario.username,
                nombre: usuario.nombre,
                rol: usuario.rol
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

        // ✅ Verificar refresh token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'tu-refresh-secret-key');
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Refresh token expirado. Por favor inicia sesión nuevamente'
                });
            }
            return res.status(401).json({
                success: false,
                error: 'Refresh token inválido'
            });
        }

        // ✅ Verificar que el usuario existe
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

        const usuario = userResult.rows[0];

        // ✅ Generar nuevo access token
        const { accessToken: newAccessToken } = generateTokens(usuario.id, usuario.rol);

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
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado'
            });
        }

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
// VERIFICAR TOKEN (TEST)
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
// OBTENER PERFIL ACTUAL
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
            usuario: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error obteniendo perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor'
        });
    }
};

// ============================================
// CAMBIAR CONTRASEÑA
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

        // ✅ Validar inputs
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

        // Obtener usuario
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

        const usuario = result.rows[0];

        // ✅ Verificar contraseña actual
        const passwordMatch = await bcrypt.compare(passwordActual, usuario.password);
        
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Contraseña actual incorrecta'
            });
        }

        // ✅ Hash de nueva contraseña
        const passwordNuevaHash = await bcrypt.hash(passwordNueva, 10);

        // ✅ Actualizar contraseña
        await pool.query(
            'UPDATE usuarios SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [passwordNuevaHash, userId]
        );

        res.json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        console.error('❌ Error cambiando contraseña:', error);
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
// ============================================
// backend/src/controllers/authController.js
// ✅ VERSIÓN MEJORADA CON JWT SEGURO
// ============================================

const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// ============================================
// GENERAR TOKENS (ACCESS + REFRESH)
// ============================================
const generateTokens = (userId, userRole = 'cliente') => {
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
        const { email, password } = req.body;

        // ✅ Validar inputs
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email y contraseña requeridos'
            });
        }

        // Buscar usuario
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            // ✅ No revelar si el email existe
            return res.status(401).json({
                success: false,
                error: 'Email o contraseña inválidos'
            });
        }

        const usuario = result.rows[0];

        // ✅ Validar contraseña (en producción, usar bcrypt)
        // Nota: Esto es un ejemplo simple. En producción:
        // const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
        if (usuario.password !== password) {
            return res.status(401).json({
                success: false,
                error: 'Email o contraseña inválidos'
            });
        }

        // ✅ Generar tokens
        const { accessToken, refreshToken } = generateTokens(usuario.id, usuario.rol || 'cliente');

        // ✅ Guardar refresh token en BD (opcional, para logout en todos los devices)
        await pool.query(
            `UPDATE usuarios SET refresh_token = $1, ultimo_login = CURRENT_TIMESTAMP 
             WHERE id = $2`,
            [refreshToken, usuario.id]
        );

        // ✅ Responder con tokens
        res.json({
            success: true,
            message: 'Sesión iniciada correctamente',
            accessToken,
            refreshToken,
            usuario: {
                id: usuario.id,
                email: usuario.email,
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

        // ✅ Verificar que el token coincida con el de BD
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

        // ✅ Verificar que el token matches
        if (usuario.refresh_token !== token) {
            return res.status(401).json({
                success: false,
                error: 'Refresh token no válido'
            });
        }

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
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado'
            });
        }

        // ✅ Invalidar refresh token en BD
        await pool.query(
            'UPDATE usuarios SET refresh_token = NULL WHERE id = $1',
            [userId]
        );

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
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado'
            });
        }

        const result = await pool.query(
            'SELECT id, email, nombre, rol, fecha_creacion FROM usuarios WHERE id = $1',
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
        const userId = req.user?.id;
        const { passwordActual, passwordNueva, passwordNuevaConfirm } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado'
            });
        }

        // ✅ Validar inputs
        if (!passwordActual || !passwordNueva || !passwordNuevaConfirm) {
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son requeridos'
            });
        }

        if (passwordNueva !== passwordNuevaConfirm) {
            return res.status(400).json({
                success: false,
                error: 'Las contraseñas no coinciden'
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
        // En producción: await bcrypt.compare(passwordActual, usuario.password_hash)
        if (usuario.password !== passwordActual) {
            return res.status(401).json({
                success: false,
                error: 'Contraseña actual incorrecta'
            });
        }

        // ✅ Actualizar contraseña
        // En producción: usar bcrypt.hash()
        await pool.query(
            'UPDATE usuarios SET password = $1 WHERE id = $2',
            [passwordNueva, userId]
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
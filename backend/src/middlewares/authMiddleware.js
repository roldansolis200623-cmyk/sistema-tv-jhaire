const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        // ✅ CORREGIDO: Validar que JWT_SECRET existe
        if (!process.env.JWT_SECRET) {
            console.error('❌ CRÍTICO: JWT_SECRET no configurado');
            return res.status(500).json({ error: 'Error de configuración del servidor' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        // ✅ MEJORADO: Distinguir entre token expirado e inválido
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }
        return res.status(401).json({ error: 'Error de autenticación' });
    }
};

module.exports = authMiddleware;
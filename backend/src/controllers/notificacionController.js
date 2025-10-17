const NotificacionModel = require('../models/NotificacionModel');

const notificacionController = {
    /**
     * Obtener todas las notificaciones
     * GET /api/notificaciones
     */
    async getAll(req, res) {
        try {
            const limite = req.query.limite || 50;
            const notificaciones = await NotificacionModel.getAll(limite);
            res.json(notificaciones);
        } catch (error) {
            console.error('Error obteniendo notificaciones:', error);
            res.status(500).json({ error: 'Error obteniendo notificaciones' });
        }
    },

    /**
     * Obtener notificaciones no leídas
     * GET /api/notificaciones/no-leidas
     */
    async getNoLeidas(req, res) {
        try {
            const notificaciones = await NotificacionModel.getNoLeidas();
            res.json(notificaciones);
        } catch (error) {
            console.error('Error obteniendo notificaciones no leídas:', error);
            res.status(500).json({ error: 'Error obteniendo notificaciones no leídas' });
        }
    },

    /**
     * Contar notificaciones no leídas
     * GET /api/notificaciones/contador
     */
    async getContador(req, res) {
        try {
            const total = await NotificacionModel.contarNoLeidas();
            res.json({ total });
        } catch (error) {
            console.error('Error contando notificaciones:', error);
            res.status(500).json({ error: 'Error contando notificaciones' });
        }
    },

    /**
     * Crear notificación
     * POST /api/notificaciones
     */
    async crear(req, res) {
        try {
            const notificacion = await NotificacionModel.crear(req.body);
            res.status(201).json(notificacion);
        } catch (error) {
            console.error('Error creando notificación:', error);
            res.status(500).json({ error: 'Error creando notificación' });
        }
    },

    /**
     * Marcar notificación como leída
     * PATCH /api/notificaciones/:id/leer
     */
    async marcarComoLeida(req, res) {
        try {
            const { id } = req.params;
            const notificacion = await NotificacionModel.marcarComoLeida(id);
            
            if (!notificacion) {
                return res.status(404).json({ error: 'Notificación no encontrada' });
            }
            
            res.json(notificacion);
        } catch (error) {
            console.error('Error marcando notificación como leída:', error);
            res.status(500).json({ error: 'Error marcando notificación como leída' });
        }
    },

    /**
     * Marcar todas como leídas
     * PATCH /api/notificaciones/leer-todas
     */
    async marcarTodasComoLeidas(req, res) {
        try {
            const notificaciones = await NotificacionModel.marcarTodasComoLeidas();
            res.json({ 
                mensaje: 'Todas las notificaciones marcadas como leídas',
                total: notificaciones.length 
            });
        } catch (error) {
            console.error('Error marcando todas como leídas:', error);
            res.status(500).json({ error: 'Error marcando todas como leídas' });
        }
    },

    /**
     * Eliminar notificación
     * DELETE /api/notificaciones/:id
     */
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            const notificacion = await NotificacionModel.eliminar(id);
            
            if (!notificacion) {
                return res.status(404).json({ error: 'Notificación no encontrada' });
            }
            
            res.json({ mensaje: 'Notificación eliminada correctamente' });
        } catch (error) {
            console.error('Error eliminando notificación:', error);
            res.status(500).json({ error: 'Error eliminando notificación' });
        }
    },

    /**
     * Limpiar notificaciones antiguas
     * DELETE /api/notificaciones/limpiar-antiguas
     */
    async limpiarAntiguas(req, res) {
        try {
            const notificaciones = await NotificacionModel.limpiarAntiguas();
            res.json({ 
                mensaje: 'Notificaciones antiguas eliminadas',
                total: notificaciones.length 
            });
        } catch (error) {
            console.error('Error limpiando notificaciones:', error);
            res.status(500).json({ error: 'Error limpiando notificaciones' });
        }
    },

    /**
     * Obtener notificaciones de un cliente
     * GET /api/notificaciones/cliente/:id
     */
    async getPorCliente(req, res) {
        try {
            const { id } = req.params;
            const notificaciones = await NotificacionModel.getPorCliente(id);
            res.json(notificaciones);
        } catch (error) {
            console.error('Error obteniendo notificaciones del cliente:', error);
            res.status(500).json({ error: 'Error obteniendo notificaciones del cliente' });
        }
    }
};

module.exports = notificacionController;
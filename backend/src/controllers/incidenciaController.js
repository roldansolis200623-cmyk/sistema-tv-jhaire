const IncidenciaModel = require('../models/incidenciaModel');

const incidenciaController = {
    // Obtener todas
    getAll: async (req, res) => {
        try {
            const incidencias = await IncidenciaModel.getAll();
            res.json(incidencias);
        } catch (error) {
            console.error('Error obteniendo incidencias:', error);
            res.status(500).json({ error: 'Error obteniendo incidencias' });
        }
    },

    // Obtener por cliente
    getByCliente: async (req, res) => {
        try {
            const { clienteId } = req.params;
            const incidencias = await IncidenciaModel.getByCliente(clienteId);
            res.json(incidencias);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error obteniendo incidencias del cliente' });
        }
    },

    // Obtener por ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const incidencia = await IncidenciaModel.getById(id);
            
            if (!incidencia) {
                return res.status(404).json({ error: 'Incidencia no encontrada' });
            }
            
            res.json(incidencia);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error obteniendo incidencia' });
        }
    },

    // Crear
    create: async (req, res) => {
        try {
            const nueva = await IncidenciaModel.create(req.body);
            res.status(201).json({
                message: 'Incidencia creada exitosamente',
                incidencia: nueva
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error creando incidencia' });
        }
    },

    // Actualizar
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const actualizada = await IncidenciaModel.update(id, req.body);
            
            if (!actualizada) {
                return res.status(404).json({ error: 'Incidencia no encontrada' });
            }
            
            res.json({
                message: 'Incidencia actualizada exitosamente',
                incidencia: actualizada
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error actualizando incidencia' });
        }
    },

    // Iniciar atención
    iniciarAtencion: async (req, res) => {
        try {
            const { id } = req.params;
            const { tecnico } = req.body;
            
            const incidencia = await IncidenciaModel.iniciarAtencion(id, tecnico);
            
            res.json({
                message: 'Atención iniciada',
                incidencia
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error iniciando atención' });
        }
    },

    // Resolver
    resolver: async (req, res) => {
        try {
            const { id } = req.params;
            const { solucion, tecnico } = req.body;
            
            const incidencia = await IncidenciaModel.resolver(id, solucion, tecnico);
            
            res.json({
                message: 'Incidencia resuelta',
                incidencia
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error resolviendo incidencia' });
        }
    },

    // Cancelar
    cancelar: async (req, res) => {
        try {
            const { id } = req.params;
            const { motivo } = req.body;
            
            const incidencia = await IncidenciaModel.cancelar(id, motivo);
            
            res.json({
                message: 'Incidencia cancelada',
                incidencia
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error cancelando incidencia' });
        }
    },

    // Eliminar
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const eliminada = await IncidenciaModel.delete(id);
            
            if (!eliminada) {
                return res.status(404).json({ error: 'Incidencia no encontrada' });
            }
            
            res.json({
                message: 'Incidencia eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error eliminando incidencia' });
        }
    },

    // Estadísticas
    getEstadisticas: async (req, res) => {
        try {
            const stats = await IncidenciaModel.getEstadisticas();
            res.json(stats);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error obteniendo estadísticas' });
        }
    },

    // Incidencias del día
    getHoy: async (req, res) => {
        try {
            const incidencias = await IncidenciaModel.getHoy();
            res.json(incidencias);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error obteniendo incidencias del día' });
        }
    }
};

module.exports = incidenciaController;
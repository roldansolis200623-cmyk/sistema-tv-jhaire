const PerfilInternetModel = require('../models/perfilInternetModel');

const perfilInternetController = {
    getAll: async (req, res) => {
        try {
            const perfiles = await PerfilInternetModel.getAll();
            res.json(perfiles);
        } catch (error) {
            console.error('Error obteniendo perfiles:', error);
            res.status(500).json({ error: 'Error obteniendo perfiles' });
        }
    },

    getById: async (req, res) => {
        try {
            const perfil = await PerfilInternetModel.getById(req.params.id);
            if (!perfil) {
                return res.status(404).json({ error: 'Perfil no encontrado' });
            }
            res.json(perfil);
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            res.status(500).json({ error: 'Error obteniendo perfil' });
        }
    },

    create: async (req, res) => {
        try {
            const perfil = await PerfilInternetModel.create(req.body);
            res.status(201).json(perfil);
        } catch (error) {
            console.error('Error creando perfil:', error);
            res.status(500).json({ error: 'Error creando perfil' });
        }
    },

    update: async (req, res) => {
        try {
            const perfil = await PerfilInternetModel.update(req.params.id, req.body);
            if (!perfil) {
                return res.status(404).json({ error: 'Perfil no encontrado' });
            }
            res.json(perfil);
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            res.status(500).json({ error: 'Error actualizando perfil' });
        }
    },

    delete: async (req, res) => {
        try {
            const perfil = await PerfilInternetModel.delete(req.params.id);
            if (!perfil) {
                return res.status(404).json({ error: 'Perfil no encontrado' });
            }
            res.json({ message: 'Perfil eliminado correctamente' });
        } catch (error) {
            console.error('Error eliminando perfil:', error);
            res.status(500).json({ error: 'Error eliminando perfil' });
        }
    }
};

module.exports = perfilInternetController;
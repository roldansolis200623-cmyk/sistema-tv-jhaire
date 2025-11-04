// ============================================
// frontend/src/services/cronService.js
// SERVICIO COMPLETO PARA CRON JOBS
// ============================================

import api from './api';

const cronService = {
    // ============================================
    // EJECUTAR TAREA MANUAL
    // ============================================
    ejecutarTarea: async (tarea) => {
        try {
            const response = await api.post(`/cron/ejecutar/${tarea}`);
            return response.data;
        } catch (error) {
            console.error(`Error ejecutando tarea ${tarea}:`, error);
            throw error;
        }
    },

    // ============================================
    // OBTENER LOGS
    // ============================================
    getLogs: async (tarea = null, limit = 50) => {
        try {
            const params = {};
            if (tarea) params.tarea = tarea;
            if (limit) params.limit = limit;
            
            const response = await api.get('/cron/logs', { params });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo logs:', error);
            throw error;
        }
    },

    // ============================================
    // OBTENER ESTADÍSTICAS
    // ============================================
    getEstadisticas: async () => {
        try {
            const response = await api.get('/cron/estadisticas');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    },

    // ============================================
    // LIMPIAR LOGS ANTIGUOS
    // ============================================
    limpiarLogs: async (dias = 90) => {
        try {
            const response = await api.delete('/cron/logs/limpiar', {
                params: { dias }
            });
            return response.data;
        } catch (error) {
            console.error('Error limpiando logs:', error);
            throw error;
        }
    },

    // ============================================
    // OBTENER CONFIGURACIÓN
    // ============================================
    getConfiguracion: async () => {
        try {
            const response = await api.get('/cron/configuracion');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo configuración:', error);
            throw error;
        }
    },

    // ============================================
    // ACTUALIZAR CONFIGURACIÓN
    // ============================================
    actualizarConfiguracion: async (clave, valor) => {
        try {
            const response = await api.put('/cron/configuracion', {
                clave,
                valor
            });
            return response.data;
        } catch (error) {
            console.error('Error actualizando configuración:', error);
            throw error;
        }
    }
};

export default cronService;
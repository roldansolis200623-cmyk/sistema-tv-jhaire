// ============================================
// frontend/src/services/tareasService.js
// SERVICIO DE TAREAS - COMPLETO Y SIN ERRORES
// CREAR ESTE ARCHIVO
// ============================================

import api from './api';

const tareasService = {
    // Obtener todas las tareas
    obtenerTodas: async (params = {}) => {
        try {
            const response = await api.get('/tareas', { params });
            return response.data.tareas || [];
        } catch (error) {
            console.error('Error obteniendo tareas:', error);
            throw error;
        }
    },

    // Obtener estadísticas
    obtenerEstadisticas: async () => {
        try {
            const response = await api.get('/tareas/stats');
            return response.data.stats || {};
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    },

    // Obtener tarea por ID
    obtenerPorId: async (id) => {
        try {
            const response = await api.get(`/tareas/${id}`);
            return response.data.tarea;
        } catch (error) {
            console.error('Error obteniendo tarea:', error);
            throw error;
        }
    },

    // Crear tarea
    crear: async (tarea) => {
        try {
            const response = await api.post('/tareas', tarea);
            return response.data;
        } catch (error) {
            console.error('Error creando tarea:', error);
            throw error;
        }
    },

    // Crear tarea desde IA (recomendación del Dashboard)
    crearDesdeIA: async (recomendacion) => {
        try {
            const diasVencimiento = {
                'CRÍTICA': 1,
                'ALTA': 3,
                'MEDIA': 7,
                'BAJA': 14
            };

            const fecha = new Date();
            fecha.setDate(fecha.getDate() + (diasVencimiento[recomendacion.priority] || 7));

            const tarea = {
                titulo: recomendacion.title,
                descripcion: recomendacion.description,
                tipo: 'recomendacion_ia',
                prioridad: recomendacion.priority,
                fecha_vencimiento: fecha.toISOString().split('T')[0],
                creado_por: 'ia',
                origen: 'dashboard_ejecutivo',
                metadata: {
                    recomendacion_original: recomendacion,
                    fecha_creacion_auto: new Date().toISOString(),
                    impact: recomendacion.impact,
                    effort: recomendacion.effort
                }
            };

            const response = await api.post('/tareas', tarea);
            return response.data;
        } catch (error) {
            console.error('Error creando tarea desde IA:', error);
            throw error;
        }
    },

    // Actualizar tarea
    actualizar: async (id, datos) => {
        try {
            const response = await api.put(`/tareas/${id}`, datos);
            return response.data;
        } catch (error) {
            console.error('Error actualizando tarea:', error);
            throw error;
        }
    },

    // Completar tarea
    completar: async (id) => {
        try {
            const response = await api.post(`/tareas/${id}/completar`);
            return response.data;
        } catch (error) {
            console.error('Error completando tarea:', error);
            throw error;
        }
    },

    // Eliminar tarea
    eliminar: async (id) => {
        try {
            const response = await api.delete(`/tareas/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error eliminando tarea:', error);
            throw error;
        }
    },

    // Obtener tareas urgentes
    obtenerUrgentes: async () => {
        try {
            const response = await api.get('/tareas/urgentes/lista');
            return response.data.tareas || [];
        } catch (error) {
            console.error('Error obteniendo tareas urgentes:', error);
            throw error;
        }
    },

    // Obtener tareas por tipo
    obtenerPorTipo: async (tipo) => {
        try {
            const response = await api.get('/tareas', {
                params: { tipo }
            });
            return response.data.tareas || [];
        } catch (error) {
            console.error('Error obteniendo tareas por tipo:', error);
            throw error;
        }
    },

    // Obtener tareas por estado
    obtenerPorEstado: async (estado) => {
        try {
            const response = await api.get('/tareas', {
                params: { estado }
            });
            return response.data.tareas || [];
        } catch (error) {
            console.error('Error obteniendo tareas por estado:', error);
            throw error;
        }
    }
};

export default tareasService;
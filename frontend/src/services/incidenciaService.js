import axios from 'axios';

const API_URL = 'http://localhost:5000/api/incidencias';

const getAuthHeaders = () => ({
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
});

const incidenciaService = {
    // Obtener todas
    getAll: async () => {
        const response = await axios.get(API_URL, getAuthHeaders());
        return response.data;
    },

    // Obtener por cliente
    getByCliente: async (clienteId) => {
        const response = await axios.get(`${API_URL}/cliente/${clienteId}`, getAuthHeaders());
        return response.data;
    },

    // Obtener por ID
    getById: async (id) => {
        const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
        return response.data;
    },

    // Crear
    create: async (data) => {
        const response = await axios.post(API_URL, data, getAuthHeaders());
        return response.data;
    },

    // Actualizar
    update: async (id, data) => {
        const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
        return response.data;
    },

    // Iniciar atención
    iniciarAtencion: async (id, tecnico) => {
        const response = await axios.post(`${API_URL}/${id}/iniciar`, { tecnico }, getAuthHeaders());
        return response.data;
    },

    // Resolver
    resolver: async (id, solucion, tecnico) => {
        const response = await axios.post(`${API_URL}/${id}/resolver`, { solucion, tecnico }, getAuthHeaders());
        return response.data;
    },

    // Cancelar
    cancelar: async (id, motivo) => {
        const response = await axios.post(`${API_URL}/${id}/cancelar`, { motivo }, getAuthHeaders());
        return response.data;
    },

    // Eliminar
    delete: async (id) => {
        const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
        return response.data;
    },

    // Estadísticas
    getEstadisticas: async () => {
        const response = await axios.get(`${API_URL}/estadisticas`, getAuthHeaders());
        return response.data;
    },

    // Del día
    getHoy: async () => {
        const response = await axios.get(`${API_URL}/hoy`, getAuthHeaders());
        return response.data;
    }
};

export default incidenciaService;
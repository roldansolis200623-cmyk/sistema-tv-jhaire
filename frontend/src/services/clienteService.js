import axios from 'axios';

const API_URL = 'https://sistema-tv-jhaire-production-1248.up.railway.app/api/clientes';

const clienteService = {
    getAll: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo clientes:', error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo cliente:', error);
            throw error;
        }
    },

    crear: async (clienteData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(API_URL, clienteData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creando cliente:', error);
            throw error;
        }
    },

    actualizar: async (id, clienteData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/${id}`, clienteData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error actualizando cliente:', error);
            throw error;
        }
    },

    eliminar: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_URL}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            throw error;
        }
    },

    // 🆕 SUSPENDER CLIENTE
    suspender: async (id, datos) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/${id}/suspender`, datos, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error suspendiendo cliente:', error);
            throw error;
        }
    },

    // ✅ REACTIVAR CLIENTE - CORREGIDO
    reactivar: async (id, datos) => {
        try {
            const token = localStorage.getItem('token');
            // ✅ AHORA RECIBE OBJETO: { reactivado_por: "..." }
            const response = await axios.post(`${API_URL}/${id}/reactivar`, datos, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error reactivando cliente:', error);
            throw error;
        }
    },

    // 🆕 OBTENER HISTORIAL DE SUSPENSIONES
    getHistorialSuspensiones: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/${id}/historial-suspensiones`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            throw error;
        }
    }
};

export default clienteService;
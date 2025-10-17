import axios from 'axios';

const API_URL = 'https://sistema-tv-jhaire-production-1248.up.railway.app/api';

// Crear instancia de axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar el token en cada request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Servicios de autenticación
export const authService = {
    login: async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};

// Servicios de clientes
export const clienteService = {
    getAll: async () => {
        const response = await api.get('/clientes');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/clientes/${id}`);
        return response.data;
    },

    create: async (clienteData) => {
        const response = await api.post('/clientes', clienteData);
        return response.data;
    },

    update: async (id, clienteData) => {
        const response = await api.put(`/clientes/${id}`, clienteData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/clientes/${id}`);
        return response.data;
    }
}; // <-- ESTA LLAVE FALTABA

// Servicios de pagos
export const pagoService = {
    getAll: async () => {
        const response = await api.get('/pagos');
        return response.data;
    },

    getPorCliente: async (clienteId) => {
        const response = await api.get(`/pagos/cliente/${clienteId}`);
        return response.data;
    },

    crear: async (pagoData) => {
        const response = await api.post('/pagos', pagoData);
        return response.data;
    },

    getEstadisticas: async () => {
        const response = await api.get('/pagos/estadisticas');
        return response.data;
    },

    getPorRangoFechas: async (fechaInicio, fechaFin) => {
        const response = await api.get('/pagos/rango', {
            params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
        });
        return response.data;
    },

    eliminar: async (pagoId) => {
        const response = await api.delete(`/pagos/${pagoId}`);
        return response.data;
    }
};

export default api;
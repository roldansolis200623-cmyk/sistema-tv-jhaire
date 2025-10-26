import axios from 'axios';

// ✅ URL de producción (sin cambios)
const API_URL = 'https://sistema-tv-jhaire-production-1248.up.railway.app/api';

console.log('🔗 API URL configurada:', API_URL);

// Crear instancia de axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000 // ✅ Timeout de 30 segundos
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

// ✅ NUEVO: Interceptor para manejar errores de respuesta
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        
        if (error.response?.status === 429) {
            // Rate limit excedido
            console.warn('⚠️ Demasiadas solicitudes. Espera un momento.');
        }
        
        return Promise.reject(error);
    }
);

// Servicios de autenticación
export const authService = {
    login: async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parseando usuario:', error);
            return null;
        }
    },

    // ✅ NUEVO: Cambiar contraseña
    changePassword: async (currentPassword, newPassword) => {
        try {
            const response = await api.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
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
};

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
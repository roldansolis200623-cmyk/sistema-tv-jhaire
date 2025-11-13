// ============================================
// frontend/src/services/api.js
// CONFIGURACIÓN COMPLETA DE AXIOS + SERVICIOS
// ============================================

import axios from 'axios';

// ✅ URL de producción (Railway)
const API_URL = process.env.REACT_APP_API_URL || 'https://sistema-tv-jhaire-production-1248.up.railway.app/api';

console.log('🔗 API URL configurada:', API_URL);

// ============================================
// CREAR INSTANCIA DE AXIOS
// ============================================
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 segundos
});

// ============================================
// INTERCEPTOR - AGREGAR TOKEN AUTOMÁTICO
// ============================================
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

// ============================================
// INTERCEPTOR - MANEJAR ERRORES DE RESPUESTA
// ============================================
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

// ============================================
// SERVICIOS DE AUTENTICACIÓN
// ============================================
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

// ============================================
// SERVICIOS DE CLIENTES
// ============================================
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

// ============================================
// SERVICIOS DE PAGOS
// ============================================
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

// ============================================
// ✅ NUEVO: SERVICIOS DE DASHBOARD
// ============================================
export const dashboardService = {
    getKPIs: async () => {
        try {
            const response = await api.get('/dashboard/kpis');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo KPIs:', error);
            throw error;
        }
    },

    getIngresosMensuales: async () => {
        try {
            const response = await api.get('/dashboard/ingresos-mensuales');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo ingresos mensuales:', error);
            throw error;
        }
    },

    getMejoresPagadores: async () => {
        try {
            const response = await api.get('/dashboard/mejores-pagadores');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo mejores pagadores:', error);
            throw error;
        }
    },

    getPeoresPagadores: async () => {
        try {
            const response = await api.get('/dashboard/peores-pagadores');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo peores pagadores:', error);
            throw error;
        }
    },

    getDistribucionEstado: async () => {
        try {
            const response = await api.get('/dashboard/distribucion-estado');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo distribución por estado:', error);
            throw error;
        }
    },

    getDistribucionGeografica: async () => {
        try {
            const response = await api.get('/dashboard/distribucion-geografica');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo distribución geográfica:', error);
            throw error;
        }
    },

    getTasaMorosidad: async () => {
        try {
            const response = await api.get('/dashboard/tasa-morosidad');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo tasa morosidad:', error);
            throw error;
        }
    },

    getNuevosClientes: async () => {
        try {
            const response = await api.get('/dashboard/nuevos-clientes');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo nuevos clientes:', error);
            throw error;
        }
    },

    getProyeccionIngresos: async () => {
        try {
            const response = await api.get('/dashboard/proyeccion-ingresos');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo proyección:', error);
            throw error;
        }
    },

    getClientesRiesgo: async () => {
        try {
            const response = await api.get('/dashboard/clientes-riesgo');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo clientes en riesgo:', error);
            throw error;
        }
    },

    getResumenCompleto: async () => {
        try {
            const response = await api.get('/dashboard/resumen');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo resumen completo:', error);
            throw error;
        }
    }
};

// ============================================
// ✅ NUEVO: SERVICIOS DE CRON
// ============================================
export const cronService = {
    ejecutarTarea: async (tarea) => {
        try {
            const response = await api.post(`/cron/ejecutar/${tarea}`);
            return response.data;
        } catch (error) {
            console.error(`Error ejecutando tarea ${tarea}:`, error);
            throw error;
        }
    },

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

    getEstadisticas: async () => {
        try {
            const response = await api.get('/cron/estadisticas');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    },

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

    getConfiguracion: async () => {
        try {
            const response = await api.get('/cron/configuracion');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo configuración:', error);
            throw error;
        }
    },

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

// ============================================
// EXPORTAR API COMO DEFAULT
// ============================================
export default api;
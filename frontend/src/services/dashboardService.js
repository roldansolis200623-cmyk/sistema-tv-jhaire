// ============================================
// frontend/src/services/dashboardService.js
// SERVICIO COMPLETO PARA DASHBOARD EJECUTIVO
// ============================================

import api from './api';

const dashboardService = {
    // ============================================
    // OBTENER KPIS PRINCIPALES
    // ============================================
    getKPIs: async () => {
        try {
            const response = await api.get('/dashboard/kpis');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo KPIs:', error);
            throw error;
        }
    },

    // ============================================
    // INGRESOS MENSUALES
    // ============================================
    getIngresosMensuales: async () => {
        try {
            const response = await api.get('/dashboard/ingresos-mensuales');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo ingresos mensuales:', error);
            throw error;
        }
    },

    // ============================================
    // TOP PAGADORES
    // ============================================
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

    // ============================================
    // DISTRIBUCIONES
    // ============================================
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

    // ============================================
    // MÉTRICAS TEMPORALES
    // ============================================
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

    // ============================================
    // PROYECCIONES Y RIESGOS
    // ============================================
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

    // ============================================
    // RESUMEN COMPLETO
    // ============================================
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

export default dashboardService;
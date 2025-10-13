import axios from 'axios';

const API_URL = 'http://localhost:5000/api/pagos';

// Crear instancia de axios con token
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const pagoService = {
    /**
     * Obtener todos los pagos
     */
    getAll: async () => {
        try {
            const response = await axios.get(API_URL, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo pagos:', error);
            throw error;
        }
    },

    /**
     * Obtener pagos de un cliente específico
     */
    getPorCliente: async (clienteId) => {
        try {
            const response = await axios.get(`${API_URL}/cliente/${clienteId}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo pagos del cliente:', error);
            throw error;
        }
    },

    /**
     * Registrar un nuevo pago
     */
    crear: async (pagoData) => {
        try {
            console.log('📤 pagoService.crear() - Enviando:', pagoData);
            
            const response = await axios.post(API_URL, pagoData, {
                headers: getAuthHeader()
            });
            
            console.log('✅ pagoService.crear() - Respuesta:', response.data);
            
            return response.data;
        } catch (error) {
            console.error('❌ pagoService.crear() - Error:', error);
            console.error('❌ Error response:', error.response?.data);
            throw error;
        }
    },

    /**
     * Alias de crear - para compatibilidad
     * (Muchos componentes llaman a registrar() en vez de crear())
     */
    registrar: async (pagoData) => {
        console.log('📤 pagoService.registrar() - Redirigiendo a crear()');
        return await pagoService.crear(pagoData);
    },

    /**
     * Obtener estadísticas de pagos
     */
    getEstadisticas: async () => {
        try {
            const response = await axios.get(`${API_URL}/estadisticas`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    },

    /**
     * Obtener pagos por rango de fechas
     */
    getPorRangoFechas: async (fechaInicio, fechaFin) => {
        try {
            const response = await axios.get(`${API_URL}/rango`, {
                params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo pagos por rango:', error);
            throw error;
        }
    },

    /**
     * Eliminar un pago
     */
    eliminar: async (pagoId) => {
        try {
            const response = await axios.delete(`${API_URL}/${pagoId}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error eliminando pago:', error);
            throw error;
        }
    },

    /**
     * 🆕 Recalcular todas las deudas
     */
    recalcularDeudas: async () => {
        try {
            const response = await axios.post(`${API_URL}/recalcular-deudas`, {}, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error recalculando deudas:', error);
            throw error;
        }
    }
};

export default pagoService;
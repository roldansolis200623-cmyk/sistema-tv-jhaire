import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class NotificacionInteligenteService {
    /**
     * Obtener token del localStorage
     */
    getAuthHeader() {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    /**
     * Obtener resumen/contadores de notificaciones
     */
    async obtenerResumen() {
        try {
            const response = await axios.get(
                `${API_URL}/notificaciones-inteligentes/resumen`,
                { headers: this.getAuthHeader() }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo resumen:', error);
            throw error;
        }
    }

    /**
     * Obtener todas las notificaciones con filtros opcionales
     * @param {Object} filtros - { tipo, prioridad, leida, limit, offset }
     */
    async obtenerTodas(filtros = {}) {
        try {
            const params = new URLSearchParams();
            
            if (filtros.tipo) params.append('tipo', filtros.tipo);
            if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
            if (filtros.leida !== undefined) params.append('leida', filtros.leida);
            if (filtros.limit) params.append('limit', filtros.limit);
            if (filtros.offset) params.append('offset', filtros.offset);

            const response = await axios.get(
                `${API_URL}/notificaciones-inteligentes?${params.toString()}`,
                { headers: this.getAuthHeader() }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo notificaciones:', error);
            throw error;
        }
    }

    /**
     * Obtener notificaciones de un cliente específico
     */
    async obtenerPorCliente(clienteId) {
        try {
            const response = await axios.get(
                `${API_URL}/notificaciones-inteligentes/cliente/${clienteId}`,
                { headers: this.getAuthHeader() }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo notificaciones del cliente:', error);
            throw error;
        }
    }

    /**
     * Generar/actualizar notificaciones
     */
    async generar() {
        try {
            const response = await axios.post(
                `${API_URL}/notificaciones-inteligentes/generar`,
                {},
                { headers: this.getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error generando notificaciones:', error);
            throw error;
        }
    }

    /**
     * Marcar notificación como leída
     */
    async marcarLeida(notificacionId) {
        try {
            const response = await axios.patch(
                `${API_URL}/notificaciones-inteligentes/${notificacionId}/leida`,
                {},
                { headers: this.getAuthHeader() }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error marcando notificación:', error);
            throw error;
        }
    }

    /**
     * Marcar múltiples notificaciones como leídas
     */
    async marcarVariasLeidas(notificacionIds) {
        try {
            const response = await axios.patch(
                `${API_URL}/notificaciones-inteligentes/leer-varias`,
                { ids: notificacionIds },
                { headers: this.getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Error marcando varias notificaciones:', error);
            throw error;
        }
    }

    /**
     * Archivar notificación
     */
    async archivar(notificacionId) {
        try {
            const response = await axios.delete(
                `${API_URL}/notificaciones-inteligentes/${notificacionId}/archivar`,
                { headers: this.getAuthHeader() }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error archivando notificación:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas generales
     */
    async obtenerEstadisticas() {
        try {
            const response = await axios.get(
                `${API_URL}/notificaciones-inteligentes/estadisticas`,
                { headers: this.getAuthHeader() }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    /**
     * Obtener clientes con patrones irregulares
     */
    async obtenerClientesIrregulares() {
        try {
            const response = await axios.get(
                `${API_URL}/notificaciones-inteligentes/clientes-irregulares`,
                { headers: this.getAuthHeader() }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo clientes irregulares:', error);
            throw error;
        }
    }

    /**
     * Calcular patrón de pago de un cliente
     */
    async calcularPatron(clienteId) {
        try {
            const response = await axios.get(
                `${API_URL}/notificaciones-inteligentes/patron/${clienteId}`,
                { headers: this.getAuthHeader() }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error calculando patrón:', error);
            throw error;
        }
    }

    /**
     * Actualizar modalidad de pago de un cliente
     */
    async actualizarModalidad(clienteId, modalidad, notas = null) {
        try {
            const response = await axios.put(
                `${API_URL}/notificaciones-inteligentes/cliente/${clienteId}/modalidad`,
                { modalidad, notas },
                { headers: this.getAuthHeader() }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error actualizando modalidad:', error);
            throw error;
        }
    }
}

export default new NotificacionInteligenteService();
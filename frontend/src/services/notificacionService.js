const API_URL = 'https://sistema-tv-jhaire-production-1248.up.railway.app/api';

const notificacionService = {
    /**
     * Obtener todas las notificaciones
     */
    async getAll(limite = 50) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/notificaciones?limite=${limite}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error obteniendo notificaciones');
        }

        return response.json();
    },

    /**
     * Obtener notificaciones no leídas
     */
    async getNoLeidas() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/notificaciones/no-leidas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error obteniendo notificaciones no leídas');
        }

        return response.json();
    },

    /**
     * Obtener contador de notificaciones no leídas
     */
    async getContador() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/notificaciones/contador`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error obteniendo contador');
        }

        return response.json();
    },

    /**
     * Marcar notificación como leída
     */
    async marcarComoLeida(id) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/notificaciones/${id}/leer`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error marcando notificación como leída');
        }

        return response.json();
    },

    /**
     * Marcar todas como leídas
     */
    async marcarTodasComoLeidas() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/notificaciones/leer-todas`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error marcando todas como leídas');
        }

        return response.json();
    },

    /**
     * Eliminar notificación
     */
    async eliminar(id) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/notificaciones/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error eliminando notificación');
        }

        return response.json();
    }
};

export default notificacionService;
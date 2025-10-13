const API_URL = 'http://localhost:5000/api';

const perfilInternetService = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/perfiles-internet`);
        if (!response.ok) throw new Error('Error obteniendo perfiles');
        return response.json();
    },

    getById: async (id) => {
        const response = await fetch(`${API_URL}/perfiles-internet/${id}`);
        if (!response.ok) throw new Error('Error obteniendo perfil');
        return response.json();
    },

    create: async (data) => {
        const response = await fetch(`${API_URL}/perfiles-internet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error creando perfil');
        return response.json();
    }
};

export default perfilInternetService;
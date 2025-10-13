const pool = require('../config/database');

const PerfilInternetModel = {
    crearTabla: async () => {
        const query = `
            CREATE TABLE IF NOT EXISTS perfiles_internet (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                velocidad INTEGER NOT NULL,
                precio_regular DECIMAL(10,2) NOT NULL,
                precio_minimo DECIMAL(10,2) NOT NULL,
                descripcion TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await pool.query(query);
    },

    getAll: async () => {
        const result = await pool.query(
            'SELECT * FROM perfiles_internet ORDER BY velocidad ASC'
        );
        return result.rows;
    },

    getById: async (id) => {
        const result = await pool.query(
            'SELECT * FROM perfiles_internet WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    create: async (data) => {
        const { nombre, velocidad, precio_regular, precio_minimo, descripcion } = data;
        const result = await pool.query(
            'INSERT INTO perfiles_internet (nombre, velocidad, precio_regular, precio_minimo, descripcion) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nombre, velocidad, precio_regular, precio_minimo, descripcion]
        );
        return result.rows[0];
    },

    update: async (id, data) => {
        const { nombre, velocidad, precio_regular, precio_minimo, descripcion } = data;
        const result = await pool.query(
            'UPDATE perfiles_internet SET nombre = $1, velocidad = $2, precio_regular = $3, precio_minimo = $4, descripcion = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
            [nombre, velocidad, precio_regular, precio_minimo, descripcion, id]
        );
        return result.rows[0];
    },

    delete: async (id) => {
        const result = await pool.query(
            'DELETE FROM perfiles_internet WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }
};

module.exports = PerfilInternetModel;
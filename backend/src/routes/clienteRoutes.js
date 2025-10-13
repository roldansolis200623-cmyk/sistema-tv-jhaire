const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const authMiddleware = require('../middlewares/authMiddleware');
const pool = require('../config/database');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todos los clientes
router.get('/', clienteController.getAll);

// Obtener cliente por ID
router.get('/:id', clienteController.getById);

// Crear nuevo cliente
router.post('/', clienteController.create);

// Actualizar cliente
router.put('/:id', clienteController.update);

// Eliminar cliente
router.delete('/:id', clienteController.delete);

// RUTAS PARA SUSPENSIÓN
router.post('/:id/suspender', clienteController.suspender);
router.post('/:id/reactivar', clienteController.reactivar);
router.get('/:id/historial-suspensiones', clienteController.getHistorialSuspensiones);

// RUTAS PARA MIGRACIONES E HISTORIAL COMPLETO
router.get('/:id/migraciones', clienteController.getHistorialMigraciones);
router.get('/:id/historial-completo', clienteController.getHistorialCompleto);

// RUTA DE PRUEBA SIMPLE
router.get('/:id/test-historial', (req, res) => {
    res.json({ 
        mensaje: 'El endpoint funciona!',
        clienteId: req.params.id,
        timestamp: new Date()
    });
});

// ====================================
// 🆕 VENCIMIENTOS PARA CALENDARIO
// ====================================
router.get('/vencimientos', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const query = `
      SELECT 
        id, codigo, nombre, direccion, telefono,
        tipo_servicio, precio_mensual, proximo_pago, estado
      FROM clientes
      WHERE DATE(proximo_pago) BETWEEN $1 AND $2
      AND estado = 'ACTIVO'
      ORDER BY proximo_pago ASC
    `;

    const result = await pool.query(query, [fechaInicio, fechaFin]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener vencimientos:', error);
    res.status(500).json({ error: 'Error al obtener vencimientos' });
  }
});

// ====================================
// 🆕 BÚSQUEDA GLOBAL INTELIGENTE
// ====================================
router.get('/buscar', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const searchTerm = `%${q}%`;

    const query = `
      SELECT 
        id, codigo, nombre, dni, direccion, telefono,
        tipo_servicio, precio_mensual, estado, email
      FROM clientes
      WHERE 
        nombre ILIKE $1 OR
        codigo ILIKE $1 OR
        dni ILIKE $1 OR
        direccion ILIKE $1 OR
        telefono ILIKE $1 OR
        email ILIKE $1
      ORDER BY nombre ASC
      LIMIT 20
    `;

    const result = await pool.query(query, [searchTerm]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ error: 'Error en búsqueda' });
  }
});

module.exports = router;
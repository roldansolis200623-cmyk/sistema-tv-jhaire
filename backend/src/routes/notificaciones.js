// src/routes/notificaciones.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middlewares/authMiddleware');
const cron = require('node-cron');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GENERAR NOTIFICACIONES AUTOMÁTICAS
const generarNotificaciones = async () => {
  try {
    console.log('🔔 Generando notificaciones...');
    
    // 1. CLIENTES QUE VENCEN HOY
    const vencenHoy = await pool.query(`
      SELECT id, nombre, codigo, proximo_pago 
      FROM clientes 
      WHERE DATE(proximo_pago) = CURRENT_DATE 
      AND estado = 'ACTIVO'
    `);

    for (const cliente of vencenHoy.rows) {
      await pool.query(`
        INSERT INTO notificaciones (tipo, titulo, mensaje, cliente_id, prioridad)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [
        'VENCIMIENTO_HOY',
        'Cliente vence HOY',
        `${cliente.nombre} (${cliente.codigo}) vence hoy`,
        cliente.id,
        'alta'
      ]);
    }

    // 2. CLIENTES CON 2+ MESES DE DEUDA
    const deudores2 = await pool.query(`
      SELECT id, nombre, codigo, meses_deuda 
      FROM clientes 
      WHERE meses_deuda >= 2 AND meses_deuda < 3
      AND estado = 'ACTIVO'
    `);

    for (const cliente of deudores2.rows) {
      await pool.query(`
        INSERT INTO notificaciones (tipo, titulo, mensaje, cliente_id, prioridad)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [
        'DEUDA_2_MESES',
        'Cliente con 2 meses de deuda',
        `${cliente.nombre} (${cliente.codigo}) tiene ${cliente.meses_deuda} meses sin pagar`,
        cliente.id,
        'media'
      ]);
    }

    // 3. CLIENTES CON 3+ MESES DE DEUDA
    const deudores3 = await pool.query(`
      SELECT id, nombre, codigo, meses_deuda 
      FROM clientes 
      WHERE meses_deuda >= 3
      AND estado = 'ACTIVO'
    `);

    for (const cliente of deudores3.rows) {
      await pool.query(`
        INSERT INTO notificaciones (tipo, titulo, mensaje, cliente_id, prioridad)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [
        'DEUDA_3_MESES',
        '🚨 URGENTE: 3+ meses de deuda',
        `${cliente.nombre} (${cliente.codigo}) tiene ${cliente.meses_deuda} meses sin pagar`,
        cliente.id,
        'urgente'
      ]);
    }

    console.log('✅ Notificaciones generadas correctamente');
    
  } catch (error) {
    console.error('❌ Error al generar notificaciones:', error);
  }
};

// Ejecutar cada hora
cron.schedule('0 * * * *', generarNotificaciones);
// Ejecutar al iniciar
generarNotificaciones();

// OBTENER TODAS LAS NOTIFICACIONES
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        n.*,
        c.nombre as cliente_nombre,
        c.codigo as cliente_codigo
      FROM notificaciones n
      LEFT JOIN clientes c ON n.cliente_id = c.id
      WHERE n.eliminada = FALSE
      ORDER BY 
        CASE n.prioridad
          WHEN 'urgente' THEN 1
          WHEN 'alta' THEN 2
          WHEN 'media' THEN 3
          WHEN 'baja' THEN 4
        END,
        n.leida ASC,
        n.fecha_creacion DESC
      LIMIT 100
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});

// CONTADOR DE NO LEÍDAS
router.get('/contador', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as no_leidas 
      FROM notificaciones 
      WHERE leida = FALSE AND eliminada = FALSE
    `);

    res.json({ no_leidas: parseInt(result.rows[0].no_leidas) });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al contar' });
  }
});

// MARCAR COMO LEÍDA
router.patch('/:id/leer', async (req, res) => {
  try {
    await pool.query(
      'UPDATE notificaciones SET leida = TRUE WHERE id = $1',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al marcar' });
  }
});

// MARCAR TODAS COMO LEÍDAS
router.patch('/marcar-todas-leidas', async (req, res) => {
  try {
    await pool.query('UPDATE notificaciones SET leida = TRUE WHERE leida = FALSE');
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error' });
  }
});

// ELIMINAR NOTIFICACIÓN
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      'UPDATE notificaciones SET eliminada = TRUE WHERE id = $1',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

module.exports = router;
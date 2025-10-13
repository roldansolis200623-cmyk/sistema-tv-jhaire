const whatsappService = require('../services/whatsappService');
const pool = require('../config/database');

exports.enviarRecordatorioIndividual = async (req, res) => {
    try {
        const { clienteId } = req.params;
        const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [clienteId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        
        const cliente = result.rows[0];
        const resultado = await whatsappService.enviarRecordatorioPago(cliente);
        
        if (resultado.success) {
            res.json({ message: 'Mensaje enviado exitosamente' });
        } else {
            res.status(500).json({ error: 'Error al enviar mensaje', details: resultado.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.enviarRecordatorioDeudores = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes WHERE meses_deuda > 0 AND estado = $1', ['activo']);
        const deudores = result.rows;
        
        if (deudores.length === 0) {
            return res.json({ message: 'No hay deudores activos' });
        }
        
        const resultados = await whatsappService.enviarRecordatorioMasivo(deudores);
        res.json({ message: `Mensajes enviados a ${deudores.length} clientes`, resultados });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.enviarMensajePersonalizado = async (req, res) => {
    try {
        const { clienteId, mensaje } = req.body;
        const result = await pool.query('SELECT telefono FROM clientes WHERE id = $1', [clienteId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        
        const { telefono } = result.rows[0];
        const resultado = await whatsappService.enviarMensaje(telefono, mensaje);
        
        if (resultado.success) {
            res.json({ message: 'Mensaje enviado exitosamente' });
        } else {
            res.status(500).json({ error: 'Error al enviar mensaje', details: resultado.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
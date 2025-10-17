const PagoModel = require('../models/pagoModel');
const ClienteModel = require('../models/clienteModel');
const notificacionService = require('../services/notificacionService');

const pagoController = {
    /**
     * Obtener todos los pagos
     */
    async getAll(req, res) {
        try {
            const pagos = await PagoModel.getAll();
            res.json(pagos);
        } catch (error) {
            console.error('Error en getAll pagos:', error);
            res.status(500).json({ error: 'Error obteniendo pagos' });
        }
    },

    /**
     * Obtener pagos de un cliente
     */
    async getPorCliente(req, res) {
        try {
            const { clienteId } = req.params;
            const pagos = await PagoModel.getPorCliente(clienteId);
            res.json(pagos);
        } catch (error) {
            console.error('Error obteniendo pagos del cliente:', error);
            res.status(500).json({ error: 'Error obteniendo pagos del cliente' });
        }
    },

    /**
     * ✅ CORREGIDO - Registrar un nuevo pago sin límite de 12 meses
     */
    async crear(req, res) {
        try {
            const { 
                cliente_id, 
                monto, 
                fecha_pago, 
                metodo_pago, 
                numero_recibo,
                telefono_contacto,
                numero_operacion,
                observaciones,
                meses_pagados 
            } = req.body;

            // Validaciones básicas
            if (!cliente_id || !monto || !metodo_pago) {
                return res.status(400).json({ 
                    error: 'Faltan campos obligatorios: cliente_id, monto, metodo_pago' 
                });
            }

            if (monto <= 0) {
                return res.status(400).json({ 
                    error: 'El monto debe ser mayor a 0' 
                });
            }

            if (monto > 999999.99) {
                return res.status(400).json({ 
                    error: 'El monto excede el límite permitido (S/ 999,999.99)' 
                });
            }

            // ✅ Validar meses_pagados - SIN LÍMITE MÁXIMO ARBITRARIO
            const mesesPagadosNum = parseInt(meses_pagados) || 1;
            if (mesesPagadosNum < 1) {
                return res.status(400).json({ 
                    error: 'Debe pagar al menos 1 mes' 
                });
            }

            // ✅ LÍMITE RAZONABLE: máximo 60 meses (5 años)
            if (mesesPagadosNum > 60) {
                return res.status(400).json({ 
                    error: 'No puede pagar más de 60 meses (5 años) a la vez. Si necesita pagar más, contacte al administrador.' 
                });
            }

            const nuevoPago = await PagoModel.crear({
                cliente_id,
                monto,
                fecha_pago: fecha_pago || new Date().toISOString().split('T')[0],
                metodo_pago,
                numero_recibo,
                telefono_contacto,
                numero_operacion,
                observaciones,
                meses_pagados: mesesPagadosNum
            });

            // 🔔 NOTIFICACIÓN: Pago recibido
            const cliente = await ClienteModel.getById(cliente_id);
            if (cliente) {
                await notificacionService.notificarPagoRecibido(cliente, nuevoPago);
            }

            res.status(201).json({
                message: `Pago de ${mesesPagadosNum} mes(es) registrado correctamente`,
                pago: nuevoPago,
                success: true
            });
        } catch (error) {
            console.error('❌ Error creando pago:', error);
            res.status(500).json({ 
                error: error.message || 'Error registrando pago',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    },

    /**
     * Obtener estadísticas de pagos
     */
    async getEstadisticas(req, res) {
        try {
            const hoy = new Date();
            const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
                .toISOString().split('T')[0];
            const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
                .toISOString().split('T')[0];
            const hoyStr = hoy.toISOString().split('T')[0];

            const [pagosHoy, pagosMes, pagosTotal] = await Promise.all([
                PagoModel.calcularIngresos(hoyStr, hoyStr),
                PagoModel.calcularIngresos(primerDiaMes, ultimoDiaMes),
                PagoModel.calcularIngresos('2000-01-01', ultimoDiaMes)
            ]);

            res.json({
                pagos_hoy: pagosHoy,
                pagos_mes: pagosMes,
                pagos_total: pagosTotal
            });
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({ error: 'Error obteniendo estadísticas' });
        }
    },

    /**
     * Obtener pagos por rango de fechas
     */
    async getPorRangoFechas(req, res) {
        try {
            const { fecha_inicio, fecha_fin } = req.query;

            if (!fecha_inicio || !fecha_fin) {
                return res.status(400).json({ 
                    error: 'Debe proporcionar fecha_inicio y fecha_fin' 
                });
            }

            const pagos = await PagoModel.getPorRangoFechas(fecha_inicio, fecha_fin);
            res.json(pagos);
        } catch (error) {
            console.error('Error obteniendo pagos por rango:', error);
            res.status(500).json({ error: 'Error obteniendo pagos' });
        }
    },

    /**
     * Eliminar un pago
     */
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            await PagoModel.eliminar(id);
            
            res.json({ 
                message: 'Pago eliminado correctamente',
                success: true
            });
        } catch (error) {
            console.error('Error eliminando pago:', error);
            res.status(500).json({ 
                error: error.message || 'Error eliminando pago' 
            });
        }
    },

    /**
     * Recalcular todas las deudas
     */
    async recalcularDeudas(req, res) {
        try {
            console.log('🔄 Iniciando recálculo de deudas...');
            await PagoModel.actualizarTodosLosEstados();
            
            res.json({ 
                message: 'Deudas recalculadas correctamente',
                success: true 
            });
        } catch (error) {
            console.error('Error recalculando deudas:', error);
            res.status(500).json({ error: 'Error recalculando deudas' });
        }
    }
};

module.exports = pagoController;
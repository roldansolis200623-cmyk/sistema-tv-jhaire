const PagoModel = require('../models/pagoModel');
const ClienteModel = require('../models/clienteModel');
const notificacionService = require('../services/notificacionService');
const notificacionInteligenteService = require('../services/notificacionInteligenteService');
const pool = require('../config/database');

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
            
            // ✅ Validar que clienteId sea un número válido
            const clienteIdNum = parseInt(clienteId);
            if (isNaN(clienteIdNum) || clienteIdNum <= 0) {
                return res.status(400).json({ error: 'ID de cliente inválido' });
            }
            
            const pagos = await PagoModel.getPorCliente(clienteIdNum);
            res.json(pagos);
        } catch (error) {
            console.error('Error obteniendo pagos del cliente:', error);
            res.status(500).json({ error: 'Error obteniendo pagos del cliente' });
        }
    },

    /**
     * ✅ CORREGIDO - Registrar un nuevo pago con validaciones exhaustivas
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

            // ✅ VALIDACIONES BÁSICAS
            if (!cliente_id || !monto || !metodo_pago) {
                return res.status(400).json({ 
                    error: 'Faltan campos obligatorios: cliente_id, monto, metodo_pago' 
                });
            }

            // ✅ Validar tipo y valor de cliente_id
            const clienteIdNum = parseInt(cliente_id);
            if (isNaN(clienteIdNum) || clienteIdNum <= 0) {
                return res.status(400).json({ 
                    error: 'ID de cliente inválido' 
                });
            }

            // ✅ Validar tipo y valor de monto
            const montoNum = parseFloat(monto);
            if (isNaN(montoNum) || montoNum <= 0) {
                return res.status(400).json({ 
                    error: 'El monto debe ser un número válido mayor a 0' 
                });
            }

            if (montoNum > 999999.99) {
                return res.status(400).json({ 
                    error: 'El monto excede el límite permitido (S/ 999,999.99)' 
                });
            }

            // ✅ Validar método de pago
            const metodosPermitidos = ['efectivo', 'transferencia', 'yape', 'plin', 'tarjeta', 'deposito'];
            if (!metodosPermitidos.includes(metodo_pago.toLowerCase())) {
                return res.status(400).json({ 
                    error: `Método de pago inválido. Permitidos: ${metodosPermitidos.join(', ')}` 
                });
            }

            // ✅ Validar meses_pagados
            const mesesPagadosNum = parseInt(meses_pagados) || 1;
            if (mesesPagadosNum < 1) {
                return res.status(400).json({ 
                    error: 'Debe pagar al menos 1 mes' 
                });
            }

            // ✅ Límite razonable de meses
            if (mesesPagadosNum > 60) {
                return res.status(400).json({ 
                    error: 'No puede pagar más de 60 meses (5 años) a la vez. Si necesita pagar más, contacte al administrador.' 
                });
            }

            // ✅ Validar fecha_pago si se proporciona
            let fechaPagoFinal = fecha_pago || new Date().toISOString().split('T')[0];
            
            if (fecha_pago) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(fecha_pago)) {
                    return res.status(400).json({ 
                        error: 'Formato de fecha inválido. Use YYYY-MM-DD' 
                    });
                }
                
                const fecha = new Date(fecha_pago);
                if (isNaN(fecha.getTime())) {
                    return res.status(400).json({ 
                        error: 'Fecha inválida' 
                    });
                }
                
                // No permitir fechas futuras
                if (fecha > new Date()) {
                    return res.status(400).json({ 
                        error: 'No se permiten fechas futuras' 
                    });
                }
            }

            // ✅ Validar que el cliente existe
            const clienteExiste = await ClienteModel.getById(clienteIdNum);
            if (!clienteExiste) {
                return res.status(404).json({ 
                    error: 'Cliente no encontrado' 
                });
            }

            // ✅ Validar número de recibo si se proporciona
            if (numero_recibo && typeof numero_recibo !== 'string') {
                return res.status(400).json({ 
                    error: 'Número de recibo inválido' 
                });
            }

            // ✅ Validar teléfono de contacto si se proporciona
            if (telefono_contacto) {
                const telefonoLimpio = telefono_contacto.toString().trim();
                if (!/^\d{9}$/.test(telefonoLimpio)) {
                    return res.status(400).json({ 
                        error: 'Teléfono de contacto debe tener 9 dígitos' 
                    });
                }
            }

            // Crear el pago
            const nuevoPago = await PagoModel.crear({
                cliente_id: clienteIdNum,
                monto: montoNum,
                fecha_pago: fechaPagoFinal,
                metodo_pago: metodo_pago.toLowerCase(),
                numero_recibo,
                telefono_contacto,
                numero_operacion,
                observaciones,
                meses_pagados: mesesPagadosNum
            });

            // 🔔 Notificación: Pago recibido
            try {
                await notificacionService.notificarPagoRecibido(clienteExiste, nuevoPago);
            } catch (notifError) {
                console.error('Error enviando notificación:', notifError);
                // No fallar el pago si falla la notificación
            }

            // 🔔 Generar notificaciones inteligentes en background
            setImmediate(async () => {
                try {
                    await notificacionInteligenteService.generarNotificacionesInteligentes();
                } catch (error) {
                    console.error('Error generando notificaciones inteligentes:', error);
                }
            });

            res.status(201).json({
                message: `Pago de ${mesesPagadosNum} mes(es) registrado correctamente`,
                pago: nuevoPago,
                success: true
            });
        } catch (error) {
            console.error('❌ Error creando pago:', error.message);
            res.status(500).json({ 
                error: 'Error registrando pago. Intente nuevamente.'
            });
        }
    },

    /**
     * ✅ CORREGIDO - Obtener estadísticas de pagos con queries directas
     */
    async getEstadisticas(req, res) {
        try {
            console.log('📊 Calculando estadísticas de pagos...');
            
            const hoy = new Date();
            const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
                .toISOString().split('T')[0];
            const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
                .toISOString().split('T')[0];
            const hoyStr = hoy.toISOString().split('T')[0];

            // Pagos de hoy
            const resultHoy = await pool.query(`
                SELECT COALESCE(SUM(monto), 0) as total
                FROM pagos
                WHERE DATE(fecha_pago) = $1
            `, [hoyStr]);

            // Pagos del mes
            const resultMes = await pool.query(`
                SELECT COALESCE(SUM(monto), 0) as total
                FROM pagos
                WHERE fecha_pago >= $1 AND fecha_pago <= $2
            `, [primerDiaMes, ultimoDiaMes]);

            // Pagos totales históricos
            const resultTotal = await pool.query(`
                SELECT COALESCE(SUM(monto), 0) as total
                FROM pagos
            `);

            const estadisticas = {
                pagos_hoy: parseFloat(resultHoy.rows[0].total) || 0,
                pagos_mes: parseFloat(resultMes.rows[0].total) || 0,
                pagos_total: parseFloat(resultTotal.rows[0].total) || 0
            };

            console.log('✅ Estadísticas calculadas:', estadisticas);
            res.json(estadisticas);
            
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            res.status(500).json({ 
                error: 'Error obteniendo estadísticas',
                details: error.message 
            });
        }
    },

    /**
     * ✅ MEJORADO - Obtener pagos por rango de fechas con validaciones
     */
    async getPorRangoFechas(req, res) {
        try {
            const { fecha_inicio, fecha_fin } = req.query;

            if (!fecha_inicio || !fecha_fin) {
                return res.status(400).json({ 
                    error: 'Debe proporcionar fecha_inicio y fecha_fin' 
                });
            }

            // ✅ Validar formato de fechas
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(fecha_inicio) || !dateRegex.test(fecha_fin)) {
                return res.status(400).json({ 
                    error: 'Formato de fecha inválido. Use YYYY-MM-DD' 
                });
            }

            // ✅ Validar que sean fechas válidas
            const inicio = new Date(fecha_inicio);
            const fin = new Date(fecha_fin);

            if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
                return res.status(400).json({ 
                    error: 'Fechas inválidas' 
                });
            }

            // ✅ Validar que fecha_inicio sea menor o igual que fecha_fin
            if (inicio > fin) {
                return res.status(400).json({ 
                    error: 'La fecha de inicio debe ser menor o igual que la fecha final' 
                });
            }

            // ✅ Validar rango máximo (1 año)
            const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 año en ms
            if (fin - inicio > maxRange) {
                return res.status(400).json({ 
                    error: 'El rango máximo permitido es de 1 año' 
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
            
            // ✅ Validar ID
            const idNum = parseInt(id);
            if (isNaN(idNum) || idNum <= 0) {
                return res.status(400).json({ error: 'ID de pago inválido' });
            }
            
            await PagoModel.eliminar(idNum);
            
            res.json({ 
                message: 'Pago eliminado correctamente',
                success: true
            });
        } catch (error) {
            console.error('Error eliminando pago:', error);
            res.status(500).json({ 
                error: 'Error eliminando pago' 
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
const notificacionService = require('../services/notificacionInteligenteService');

const notificacionInteligenteController = {
    /**
     * GET /api/notificaciones-inteligentes
     * Obtener todas las notificaciones con filtros opcionales
     */
    async obtenerTodas(req, res) {
        try {
            const { tipo, prioridad, leida, archivada, limit, offset } = req.query;
            
            const filtros = {
                tipo,
                prioridad,
                leida: leida === 'true' ? true : leida === 'false' ? false : undefined,
                archivada: archivada === 'true' ? true : false,
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0
            };

            const notificaciones = await notificacionService.obtenerNotificaciones(filtros);
            
            res.json({
                success: true,
                data: notificaciones,
                filtros
            });
        } catch (error) {
            console.error('Error en obtenerTodas:', error);
            res.status(500).json({
                success: false,
                error: 'Error obteniendo notificaciones'
            });
        }
    },

    /**
     * GET /api/notificaciones-inteligentes/resumen
     * Obtener resumen/contadores de notificaciones
     */
    async obtenerResumen(req, res) {
        try {
            // ✅ Verificar que la función exista
            if (typeof notificacionService.obtenerResumen !== 'function') {
                console.warn('⚠️  obtenerResumen no está disponible en notificacionService');
                return res.json({
                    success: true,
                    data: {
                        total: 0,
                        no_leidas: 0,
                        archivadas: 0,
                        por_tipo: {},
                        por_prioridad: {}
                    },
                    mensaje: 'Resumen por defecto'
                });
            }

            const resumen = await notificacionService.obtenerResumen();
            
            res.json({
                success: true,
                data: resumen
            });
        } catch (error) {
            console.error('Error en obtenerResumen:', error);
            res.json({
                success: true,
                data: {
                    total: 0,
                    no_leidas: 0,
                    archivadas: 0,
                    por_tipo: {},
                    por_prioridad: {}
                },
                mensaje: 'Resumen por defecto (error)'
            });
        }
    },

    /**
     * GET /api/notificaciones-inteligentes/cliente/:clienteId
     * Obtener notificaciones de un cliente específico
     */
    async obtenerPorCliente(req, res) {
        try {
            const { clienteId } = req.params;
            
            if (!clienteId || isNaN(parseInt(clienteId))) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de cliente inválido'
                });
            }

            // ✅ Verificar que la función exista
            if (typeof notificacionService.obtenerPorCliente !== 'function') {
                return res.json({
                    success: true,
                    data: [],
                    mensaje: 'Notificaciones no disponibles'
                });
            }

            const notificaciones = await notificacionService.obtenerPorCliente(parseInt(clienteId));
            
            res.json({
                success: true,
                data: notificaciones
            });
        } catch (error) {
            console.error('Error en obtenerPorCliente:', error);
            res.status(500).json({
                success: false,
                error: 'Error obteniendo notificaciones del cliente'
            });
        }
    },

    /**
     * POST /api/notificaciones-inteligentes/generar
     * Generar/actualizar notificaciones para todos los clientes
     */
    async generar(req, res) {
        try {
            console.log('🔔 Iniciando generación manual de notificaciones...');

            const totalCreadas = await notificacionService.generarNotificacionesInteligentes();

            res.json({
                success: true,
                message: `Se generaron ${totalCreadas} notificaciones inteligentes`,
                data: {
                    cantidad_generadas: totalCreadas,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error en generar:', error);
            res.status(500).json({
                success: false,
                error: 'Error generando notificaciones',
                details: error.message
            });
        }
    },

    /**
     * PATCH /api/notificaciones-inteligentes/:id/leida
     * Marcar notificación como leída
     */
    async marcarLeida(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de notificación inválido'
                });
            }

            // ✅ Verificar que la función exista
            if (typeof notificacionService.marcarComoLeida !== 'function') {
                return res.json({
                    success: true,
                    message: 'Acción no disponible',
                    data: null
                });
            }

            const notificacion = await notificacionService.marcarComoLeida(parseInt(id));
            
            if (!notificacion) {
                return res.status(404).json({
                    success: false,
                    error: 'Notificación no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Notificación marcada como leída',
                data: notificacion
            });
        } catch (error) {
            console.error('Error en marcarLeida:', error);
            res.status(500).json({
                success: false,
                error: 'Error marcando notificación'
            });
        }
    },

    /**
     * PATCH /api/notificaciones-inteligentes/leer-varias
     * Marcar múltiples notificaciones como leídas
     */
    async marcarVariasLeidas(req, res) {
        try {
            const { ids } = req.body;
            
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Debe proporcionar un array de IDs'
                });
            }

            const idsValidos = ids.every(id => !isNaN(parseInt(id)));
            if (!idsValidos) {
                return res.status(400).json({
                    success: false,
                    error: 'Todos los IDs deben ser números válidos'
                });
            }

            // ✅ Verificar que la función exista
            if (typeof notificacionService.marcarVariasComoLeidas !== 'function') {
                return res.json({
                    success: true,
                    message: 'Acción no disponible',
                    data: { cantidad: 0 }
                });
            }

            const resultado = await notificacionService.marcarVariasComoLeidas(ids.map(id => parseInt(id)));
            
            res.json({
                success: true,
                message: `${resultado.cantidad} notificaciones marcadas como leídas`,
                data: resultado
            });
        } catch (error) {
            console.error('Error en marcarVariasLeidas:', error);
            res.status(500).json({
                success: false,
                error: 'Error marcando notificaciones'
            });
        }
    },

    /**
     * DELETE /api/notificaciones-inteligentes/:id/archivar
     * Archivar notificación
     */
    async archivar(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de notificación inválido'
                });
            }

            // ✅ Verificar que la función exista
            if (typeof notificacionService.archivar !== 'function') {
                return res.json({
                    success: true,
                    message: 'Acción no disponible',
                    data: null
                });
            }

            const notificacion = await notificacionService.archivar(parseInt(id));
            
            if (!notificacion) {
                return res.status(404).json({
                    success: false,
                    error: 'Notificación no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Notificación archivada',
                data: notificacion
            });
        } catch (error) {
            console.error('Error en archivar:', error);
            res.status(500).json({
                success: false,
                error: 'Error archivando notificación'
            });
        }
    },

    /**
     * GET /api/notificaciones-inteligentes/estadisticas
     * Obtener estadísticas generales
     */
    async obtenerEstadisticas(req, res) {
        try {
            // ✅ Verificar que la función exista
            if (typeof notificacionService.obtenerEstadisticas !== 'function') {
                return res.json({
                    success: true,
                    data: {
                        total_clientes: 0,
                        total_notificaciones: 0,
                        patrones_detectados: 0
                    },
                    mensaje: 'Estadísticas no disponibles'
                });
            }

            const estadisticas = await notificacionService.obtenerEstadisticas();
            
            res.json({
                success: true,
                data: estadisticas
            });
        } catch (error) {
            console.error('Error en obtenerEstadisticas:', error);
            res.json({
                success: true,
                data: {
                    total_clientes: 0,
                    total_notificaciones: 0,
                    patrones_detectados: 0
                },
                mensaje: 'Error obteniendo estadísticas'
            });
        }
    },

    /**
     * GET /api/notificaciones-inteligentes/clientes-irregulares
     * Obtener clientes con patrones de pago irregulares
     */
    async obtenerClientesIrregulares(req, res) {
        try {
            // ✅ Verificar que la función exista
            if (typeof notificacionService.obtenerClientesIrregulares !== 'function') {
                return res.json({
                    success: true,
                    data: [],
                    mensaje: 'Función no disponible'
                });
            }

            const clientes = await notificacionService.obtenerClientesIrregulares();
            
            res.json({
                success: true,
                data: clientes
            });
        } catch (error) {
            console.error('Error en obtenerClientesIrregulares:', error);
            res.status(500).json({
                success: false,
                error: 'Error obteniendo clientes irregulares'
            });
        }
    },

    /**
     * GET /api/notificaciones-inteligentes/patron/:clienteId
     * Calcular y obtener patrón de pago de un cliente
     */
    async calcularPatron(req, res) {
        try {
            const { clienteId } = req.params;
            
            if (!clienteId || isNaN(parseInt(clienteId))) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de cliente inválido'
                });
            }

            // ✅ Verificar que la función exista
            if (typeof notificacionService.calcularPatronCliente !== 'function') {
                return res.json({
                    success: true,
                    data: { patron: 'no_disponible' },
                    mensaje: 'Función no disponible'
                });
            }

            const patron = await notificacionService.calcularPatronCliente(parseInt(clienteId));
            
            res.json({
                success: true,
                data: patron
            });
        } catch (error) {
            console.error('Error en calcularPatron:', error);
            res.status(500).json({
                success: false,
                error: 'Error calculando patrón'
            });
        }
    },

    /**
     * PUT /api/notificaciones-inteligentes/cliente/:clienteId/modalidad
     * Actualizar modalidad de pago de un cliente
     */
    async actualizarModalidad(req, res) {
        try {
            const { clienteId } = req.params;
            const { modalidad, notas } = req.body;
            
            if (!clienteId || isNaN(parseInt(clienteId))) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de cliente inválido'
                });
            }

            if (!modalidad) {
                return res.status(400).json({
                    success: false,
                    error: 'Modalidad de pago requerida'
                });
            }

            const modalidadesPermitidas = ['mensual', 'bimestral', 'trimestral', 'semestral', 'anual', 'personalizado'];
            if (!modalidadesPermitidas.includes(modalidad)) {
                return res.status(400).json({
                    success: false,
                    error: `Modalidad inválida. Permitidas: ${modalidadesPermitidas.join(', ')}`
                });
            }

            // ✅ Verificar que la función exista
            if (typeof notificacionService.actualizarModalidadPago !== 'function') {
                return res.json({
                    success: true,
                    message: 'Acción no disponible',
                    data: null
                });
            }

            const cliente = await notificacionService.actualizarModalidadPago(
                parseInt(clienteId),
                modalidad,
                notas
            );
            
            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    error: 'Cliente no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Modalidad de pago actualizada',
                data: cliente
            });
        } catch (error) {
            console.error('Error en actualizarModalidad:', error);
            res.status(500).json({
                success: false,
                error: 'Error actualizando modalidad'
            });
        }
    },

    /**
     * DELETE /api/notificaciones-inteligentes/limpiar
     * Limpiar notificaciones archivadas antiguas (mantenimiento)
     */
    async limpiar(req, res) {
        try {
            const { dias = 30 } = req.query;
            
            // ✅ Verificar que la función exista
            if (typeof notificacionService.limpiarNotificacionesAntiguas !== 'function') {
                return res.json({
                    success: true,
                    message: 'Función no disponible',
                    data: { cantidad_eliminadas: 0 }
                });
            }

            const resultado = await notificacionService.limpiarNotificacionesAntiguas(parseInt(dias));
            
            res.json({
                success: true,
                message: `Se eliminaron ${resultado.cantidad_eliminadas} notificaciones archivadas`,
                data: resultado
            });
        } catch (error) {
            console.error('Error en limpiar:', error);
            res.status(500).json({
                success: false,
                error: 'Error limpiando notificaciones'
            });
        }
    }
};

module.exports = notificacionInteligenteController;
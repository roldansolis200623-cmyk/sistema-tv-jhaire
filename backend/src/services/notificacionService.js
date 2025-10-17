const NotificacionModel = require('../models/NotificacionModel');

/**
 * Servicio para generar notificaciones automáticas
 */
const notificacionService = {
    /**
     * Generar notificación de pago vencido
     */
    async notificarPagoVencido(cliente, diasVencido) {
        try {
            const notificacion = {
                tipo: 'pago_vencido',
                titulo: `Pago vencido - ${cliente.nombre} ${cliente.apellido || ''}`,
                mensaje: `El cliente tiene un pago vencido hace ${diasVencido} día(s). Monto: S/ ${cliente.precio_mensual}`,
                icono: 'alert',
                color: 'red',
                cliente_id: cliente.id,
                url: `/clientes?id=${cliente.id}`
            };
            
            await NotificacionModel.crear(notificacion);
            console.log(`📢 Notificación creada: Pago vencido - ${cliente.nombre}`);
        } catch (error) {
            console.error('Error generando notificación de pago vencido:', error);
        }
    },

    /**
     * Generar notificación de pago próximo a vencer
     */
    async notificarPagoProximo(cliente, diasRestantes) {
        try {
            const notificacion = {
                tipo: 'pago_proximo',
                titulo: `Pago próximo - ${cliente.nombre} ${cliente.apellido || ''}`,
                mensaje: `El pago vence en ${diasRestantes} día(s). Monto: S/ ${cliente.precio_mensual}`,
                icono: 'warning',
                color: 'yellow',
                cliente_id: cliente.id,
                url: `/clientes?id=${cliente.id}`
            };
            
            await NotificacionModel.crear(notificacion);
            console.log(`📢 Notificación creada: Pago próximo - ${cliente.nombre}`);
        } catch (error) {
            console.error('Error generando notificación de pago próximo:', error);
        }
    },

    /**
     * Generar notificación de cliente suspendido
     */
    async notificarClienteSuspendido(cliente, motivo) {
        try {
            const notificacion = {
                tipo: 'cliente_suspendido',
                titulo: `Cliente suspendido - ${cliente.nombre} ${cliente.apellido || ''}`,
                mensaje: `El cliente ha sido suspendido. Motivo: ${motivo}`,
                icono: 'alert',
                color: 'red',
                cliente_id: cliente.id,
                url: `/clientes?id=${cliente.id}`
            };
            
            await NotificacionModel.crear(notificacion);
            console.log(`📢 Notificación creada: Cliente suspendido - ${cliente.nombre}`);
        } catch (error) {
            console.error('Error generando notificación de cliente suspendido:', error);
        }
    },

    /**
     * Generar notificación de nuevo cliente
     */
    async notificarNuevoCliente(cliente) {
        try {
            const notificacion = {
                tipo: 'nuevo_cliente',
                titulo: `Nuevo cliente registrado`,
                mensaje: `${cliente.nombre} ${cliente.apellido || ''} - ${cliente.tipo_servicio} - S/ ${cliente.precio_mensual}/mes`,
                icono: 'success',
                color: 'green',
                cliente_id: cliente.id,
                url: `/clientes?id=${cliente.id}`
            };
            
            await NotificacionModel.crear(notificacion);
            console.log(`📢 Notificación creada: Nuevo cliente - ${cliente.nombre}`);
        } catch (error) {
            console.error('Error generando notificación de nuevo cliente:', error);
        }
    },

    /**
     * Generar notificación de pago recibido
     */
    async notificarPagoRecibido(cliente, pago) {
        try {
            const notificacion = {
                tipo: 'pago_recibido',
                titulo: `Pago recibido - ${cliente.nombre} ${cliente.apellido || ''}`,
                mensaje: `Pago de S/ ${pago.monto} recibido. Método: ${pago.metodo_pago}`,
                icono: 'success',
                color: 'green',
                cliente_id: cliente.id,
                pago_id: pago.id,
                url: `/pagos?cliente_id=${cliente.id}`
            };
            
            await NotificacionModel.crear(notificacion);
            console.log(`📢 Notificación creada: Pago recibido - ${cliente.nombre}`);
        } catch (error) {
            console.error('Error generando notificación de pago recibido:', error);
        }
    },

    /**
     * Generar notificación de cliente reactivado
     */
    async notificarClienteReactivado(cliente) {
        try {
            const notificacion = {
                tipo: 'cliente_reactivado',
                titulo: `Cliente reactivado - ${cliente.nombre} ${cliente.apellido || ''}`,
                mensaje: `El cliente ha sido reactivado y su servicio está activo nuevamente`,
                icono: 'success',
                color: 'green',
                cliente_id: cliente.id,
                url: `/clientes?id=${cliente.id}`
            };
            
            await NotificacionModel.crear(notificacion);
            console.log(`📢 Notificación creada: Cliente reactivado - ${cliente.nombre}`);
        } catch (error) {
            console.error('Error generando notificación de cliente reactivado:', error);
        }
    },

    /**
     * Verificar y generar notificaciones de pagos vencidos
     * (Ejecutar diariamente con cron)
     */
    async verificarPagosVencidos() {
        try {
            const pool = require('../config/database');
            const query = `
                SELECT * FROM clientes
                WHERE estado = 'ACTIVO'
                AND proximo_pago < CURRENT_DATE
                AND id NOT IN (
                    SELECT DISTINCT cliente_id 
                    FROM notificaciones 
                    WHERE tipo = 'pago_vencido'
                    AND fecha_creacion > CURRENT_DATE - INTERVAL '7 days'
                    AND cliente_id IS NOT NULL
                )
            `;
            
            const result = await pool.query(query);
            
            for (const cliente of result.rows) {
                const diasVencido = Math.floor((new Date() - new Date(cliente.proximo_pago)) / (1000 * 60 * 60 * 24));
                await this.notificarPagoVencido(cliente, diasVencido);
            }
            
            console.log(`✅ Verificación de pagos vencidos: ${result.rows.length} notificaciones generadas`);
        } catch (error) {
            console.error('Error verificando pagos vencidos:', error);
        }
    },

    /**
     * Verificar y generar notificaciones de pagos próximos
     * (Ejecutar diariamente con cron)
     */
    async verificarPagosProximos() {
        try {
            const pool = require('../config/database');
            const query = `
                SELECT * FROM clientes
                WHERE estado = 'ACTIVO'
                AND proximo_pago BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
                AND id NOT IN (
                    SELECT DISTINCT cliente_id 
                    FROM notificaciones 
                    WHERE tipo = 'pago_proximo'
                    AND fecha_creacion > CURRENT_DATE - INTERVAL '3 days'
                    AND cliente_id IS NOT NULL
                )
            `;
            
            const result = await pool.query(query);
            
            for (const cliente of result.rows) {
                const diasRestantes = Math.ceil((new Date(cliente.proximo_pago) - new Date()) / (1000 * 60 * 60 * 24));
                await this.notificarPagoProximo(cliente, diasRestantes);
            }
            
            console.log(`✅ Verificación de pagos próximos: ${result.rows.length} notificaciones generadas`);
        } catch (error) {
            console.error('Error verificando pagos próximos:', error);
        }
    }
};

module.exports = notificacionService;
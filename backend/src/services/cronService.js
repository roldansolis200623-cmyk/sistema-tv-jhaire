const cron = require('node-cron');
const whatsappService = require('./whatsappService');
const notificacionService = require('./notificacionService');
const pool = require('../config/database');

class CronService {
    iniciar() {
        // Recordatorio amigable - Día 28 a las 9:00 AM
        cron.schedule('0 9 28 * *', async () => {
            console.log('📅 Enviando recordatorio amigable (día 28)...');
            await this.enviarRecordatorioAmigable();
        });

        // Recordatorio final - Día 30 a las 10:00 AM
        cron.schedule('0 10 30 * *', async () => {
            console.log('⚠️ Enviando recordatorio final (día 30)...');
            await this.enviarRecordatorioFinal();
        });

        // Recordatorio de bienvenida al mes - Día 1 a las 9:00 AM
        cron.schedule('0 9 1 * *', async () => {
            console.log('👋 Enviando saludo de inicio de mes...');
            await this.enviarSaludoMensual();
        });

        // 🔔 NUEVO: Verificar pagos vencidos - Diario a las 8:00 AM
        cron.schedule('0 8 * * *', async () => {
            console.log('🔔 Verificando pagos vencidos para notificaciones...');
            await notificacionService.verificarPagosVencidos();
        });

        // 🔔 NUEVO: Verificar pagos próximos a vencer - Diario a las 8:30 AM
        cron.schedule('30 8 * * *', async () => {
            console.log('🔔 Verificando pagos próximos para notificaciones...');
            await notificacionService.verificarPagosProximos();
        });

        console.log('✅ Tareas programadas iniciadas');
        console.log('   - Día 1: Saludo mensual');
        console.log('   - Día 28: Recordatorio amigable');
        console.log('   - Día 30: Recordatorio final');
        console.log('   - Diario 8:00 AM: Verificar pagos vencidos');
        console.log('   - Diario 8:30 AM: Verificar pagos próximos');
    }

    obtenerMediosPago() {
        return `💳 MEDIOS DE PAGO DISPONIBLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 YAPE/PLIN
   💜 991-569-419
   👤 Francisca Capa Montero

📱 YAPE/PLIN
   💜 995-151-453
   👤 Damian Rosendo Campos Ugarte

🏦 BCP - SOLES
   💙 570-04329682069
   👤 Francisca Capa Montero

🏦 BCP - SOLES
   💙 570-71655133-0-75
   👤 Damian Rosendo Campos Ugarte

🏦 INTERBANK
   🟢 772-300-6808874
   👤 Telecomunicaciones Jhair

🏦 CAJA TRUJILLO
   🔴 792-321005070
   👤 Damian Rosendo Campos Ugarte

🏦 BANCO DE LA NACIÓN
   🟡 048-01086832
   👤 Damian Rosendo Campos Ugarte
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Envía tu voucher por WhatsApp
✅ Confirmaremos tu pago inmediatamente`;
    }

    async enviarRecordatorioAmigable() {
        try {
            const result = await pool.query(
                'SELECT * FROM clientes WHERE estado = $1 AND telefono IS NOT NULL',
                ['activo']
            );

            for (const cliente of result.rows) {
                const mensaje = `Hola ${cliente.nombre} 👋

Esperamos que te encuentres bien. Este es un recordatorio amigable de que tu pago mensual de *S/ ${cliente.precio_mensual}* vence pronto.

${this.obtenerMediosPago()}

Si ya realizaste tu pago, ignora este mensaje.

Gracias por tu preferencia.
*Telecomunicaciones Jhair EIRL*`;

                await whatsappService.enviarMensaje(cliente.telefono, mensaje);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            console.log(`✅ Recordatorios amigables enviados a ${result.rows.length} clientes`);
        } catch (error) {
            console.error('Error enviando recordatorios amigables:', error);
        }
    }

    async enviarRecordatorioFinal() {
        try {
            const result = await pool.query(
                'SELECT * FROM clientes WHERE estado = $1 AND telefono IS NOT NULL',
                ['activo']
            );

            for (const cliente of result.rows) {
                const mensaje = `${cliente.nombre}, este es un recordatorio importante ⚠️

Tu pago mensual de *S/ ${cliente.precio_mensual}* vence HOY (30 del mes).

Para evitar la suspensión del servicio, realiza tu pago antes de las 6:00 PM.

${this.obtenerMediosPago()}

📱 Cualquier consulta, contáctanos.

*Telecomunicaciones Jhair EIRL*`;

                await whatsappService.enviarMensaje(cliente.telefono, mensaje);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            console.log(`⚠️ Recordatorios finales enviados a ${result.rows.length} clientes`);
        } catch (error) {
            console.error('Error enviando recordatorios finales:', error);
        }
    }

    async enviarSaludoMensual() {
        try {
            const result = await pool.query(
                'SELECT * FROM clientes WHERE estado = $1 AND telefono IS NOT NULL',
                ['activo']
            );

            const mesActual = new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });

            for (const cliente of result.rows) {
                const mensaje = `¡Hola ${cliente.nombre}! 👋

Bienvenido a ${mesActual}. Gracias por confiar en nuestro servicio.

📺 Tu plan actual: *${cliente.plan || 'Plan estándar'}*
💵 Monto mensual: *S/ ${cliente.precio_mensual}*

Recuerda que tu pago vence el día 30 del mes.

${this.obtenerMediosPago()}

¡Que tengas un excelente mes!
*Telecomunicaciones Jhair EIRL*`;

                await whatsappService.enviarMensaje(cliente.telefono, mensaje);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            console.log(`👋 Saludos mensuales enviados a ${result.rows.length} clientes`);
        } catch (error) {
            console.error('Error enviando saludos mensuales:', error);
        }
    }
}

module.exports = new CronService();
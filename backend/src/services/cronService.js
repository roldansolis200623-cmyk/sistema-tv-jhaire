const cron = require('node-cron');
const whatsappService = require('./whatsappService');
const notificacionService = require('./notificacionService');
const pool = require('../config/database');

class CronService {
    iniciar() {
        // 🆕 CRÍTICO: Recalcular deudas - Día 1 a las 7:00 AM (ANTES del saludo)
        cron.schedule('0 7 1 * *', async () => {
            console.log('🔧 Recalculando todas las deudas del mes...');
            await this.recalcularDeudas();
        });

        // Recordatorio de bienvenida al mes - Día 1 a las 9:00 AM
        cron.schedule('0 9 1 * *', async () => {
            console.log('👋 Enviando saludo de inicio de mes...');
            await this.enviarSaludoMensual();
        });

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

        // 🔔 Verificar pagos vencidos - Diario a las 8:00 AM
        cron.schedule('0 8 * * *', async () => {
            console.log('🔔 Verificando pagos vencidos para notificaciones...');
            await notificacionService.verificarPagosVencidos();
        });

        // 🔔 Verificar pagos próximos a vencer - Diario a las 8:30 AM
        cron.schedule('30 8 * * *', async () => {
            console.log('🔔 Verificando pagos próximos para notificaciones...');
            await notificacionService.verificarPagosProximos();
        });

        console.log('✅ Tareas programadas iniciadas');
        console.log('   - Día 1 (7:00 AM): 🔧 Recalcular deudas automáticamente');
        console.log('   - Día 1 (9:00 AM): 👋 Saludo mensual');
        console.log('   - Día 28 (9:00 AM): 📅 Recordatorio amigable');
        console.log('   - Día 30 (10:00 AM): ⚠️ Recordatorio final');
        console.log('   - Diario (8:00 AM): 🔔 Verificar pagos vencidos');
        console.log('   - Diario (8:30 AM): 🔔 Verificar pagos próximos');
    }

    // 🆕 MÉTODO PARA RECALCULAR DEUDAS AUTOMÁTICAMENTE
    async recalcularDeudas() {
        const client = await pool.connect();
        
        try {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🔧 INICIO: Recálculo automático de deudas');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            
            // Obtener todos los clientes activos
            const clientesQuery = 'SELECT id, nombre, apellido, fecha_instalacion FROM clientes WHERE estado = $1';
            const clientesResult = await client.query(clientesQuery, ['activo']);
            
            console.log(`📊 Total de clientes activos: ${clientesResult.rows.length}\n`);
            
            let clientesCorregidos = 0;
            let clientesAdelantados = 0;
            let clientesNuevosDeudores = 0;
            
            for (const cliente of clientesResult.rows) {
                const { id, nombre, apellido, fecha_instalacion } = cliente;
                
                if (!fecha_instalacion) {
                    console.log(`⚠️  Cliente ${nombre} ${apellido} (ID: ${id}) - Sin fecha de instalación, saltando...`);
                    continue;
                }
                
                // Calcular meses desde la instalación
                const hoy = new Date();
                const instalacion = new Date(fecha_instalacion);
                
                // Normalizar a primer día del mes
                instalacion.setDate(1);
                instalacion.setHours(0, 0, 0, 0);
                hoy.setDate(1);
                hoy.setHours(0, 0, 0, 0);
                
                // Calcular meses transcurridos (mínimo 1)
                const mesesDesdeInstalacion = Math.max(1, 
                    (hoy.getFullYear() - instalacion.getFullYear()) * 12 + 
                    (hoy.getMonth() - instalacion.getMonth()) + 1
                );
                
                // Obtener total de meses pagados
                const pagosQuery = 'SELECT COALESCE(SUM(meses_pagados), 0) as total_pagado FROM pagos WHERE cliente_id = $1';
                const pagosResult = await client.query(pagosQuery, [id]);
                const totalMesesPagados = parseInt(pagosResult.rows[0].total_pagado) || 0;
                
                // Calcular deuda real (puede ser negativa = adelanto)
                const deudaReal = mesesDesdeInstalacion - totalMesesPagados;
                
                // Obtener deuda actual en BD
                const deudaActualQuery = 'SELECT meses_deuda FROM clientes WHERE id = $1';
                const deudaActualResult = await client.query(deudaActualQuery, [id]);
                const deudaActual = deudaActualResult.rows[0].meses_deuda;
                
                // Solo actualizar si hay diferencia
                if (deudaActual !== deudaReal) {
                    const updateQuery = `
                        UPDATE clientes 
                        SET meses_deuda = $1,
                            estado_pago = CASE 
                                WHEN $1 < 0 THEN 'adelantado'
                                WHEN $1 = 0 THEN 'pagado'
                                WHEN $1 <= 1 THEN 'al_dia'
                                ELSE 'deudor'
                            END,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = $2
                    `;
                    await client.query(updateQuery, [deudaReal, id]);
                    
                    if (deudaReal < 0) {
                        console.log(`✅ ${nombre} ${apellido} - ADELANTADO (${Math.abs(deudaReal)} meses)`);
                        clientesAdelantados++;
                    } else if (deudaReal > deudaActual) {
                        console.log(`📈 ${nombre} ${apellido} - Deuda: ${deudaActual} → ${deudaReal} meses`);
                        if (deudaActual === 0 && deudaReal > 0) {
                            clientesNuevosDeudores++;
                        }
                    } else {
                        console.log(`📉 ${nombre} ${apellido} - Deuda: ${deudaActual} → ${deudaReal} meses`);
                    }
                    
                    clientesCorregidos++;
                }
            }
            
            console.log('\n' + '━'.repeat(60));
            console.log('✅ PROCESO COMPLETADO');
            console.log('━'.repeat(60));
            console.log(`📊 Clientes procesados: ${clientesResult.rows.length}`);
            console.log(`🔧 Clientes actualizados: ${clientesCorregidos}`);
            console.log(`🚀 Clientes adelantados: ${clientesAdelantados}`);
            console.log(`⚠️  Nuevos deudores: ${clientesNuevosDeudores}`);
            console.log('━'.repeat(60) + '\n');
            
        } catch (error) {
            console.error('❌ Error durante el recálculo de deudas:', error);
        } finally {
            client.release();
        }
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
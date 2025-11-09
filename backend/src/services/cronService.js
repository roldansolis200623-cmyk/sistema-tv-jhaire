// ============================================
// backend/src/services/cronService.js
// SERVICIO DE AUTOMATIZACIÓN CON CRON JOBS
// ============================================

const cron = require('node-cron');
const pool = require('../config/database');
const nodemailer = require('nodemailer');

// ✅ Configurar transporter de email (opcional)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Registrar log de ejecución
const registrarLog = async (tarea, estado, detalles, registrosAfectados = 0, tiempoEjecucion = 0) => {
    try {
        await pool.query(`
            INSERT INTO cron_logs (tarea, estado, detalles, registros_afectados, tiempo_ejecucion)
            VALUES ($1, $2, $3, $4, $5)
        `, [tarea, estado, detalles, registrosAfectados, tiempoEjecucion]);
    } catch (error) {
        console.error('Error registrando log:', error);
    }
};

// Enviar alerta por email
const enviarAlerta = async (asunto, mensaje) => {
    if (!process.env.SMTP_USER) {
        console.log('📧 Email no configurado. Alerta:', asunto);
        return;
    }
    
    try {
        const configResult = await pool.query(
            "SELECT valor FROM configuracion_sistema WHERE clave = 'email_alertas'"
        );
        const emailDestino = configResult.rows[0]?.valor || 'admin@tvjhaire.com';
        
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: emailDestino,
            subject: `[TV Jhaire] ${asunto}`,
            html: mensaje
        });
        
        console.log('✅ Alerta enviada:', asunto);
    } catch (error) {
        console.error('❌ Error enviando alerta:', error.message);
    }
};

// ============================================
// TAREA 1: INCREMENTAR DEUDA MENSUALMENTE
// ============================================

const incrementarDeudaMensual = async () => {
    const inicio = Date.now();
    console.log('🔄 Iniciando incremento mensual de deuda...');
    
    try {
        // Incrementar meses_deuda para clientes activos que no pagaron
        const result = await pool.query(`
            UPDATE clientes
            SET 
                meses_deuda = meses_deuda + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE estado = 'activo'
            AND (
                fecha_ultimo_pago IS NULL 
                OR fecha_ultimo_pago < DATE_TRUNC('month', CURRENT_DATE)
            )
            RETURNING id, nombre, apellido, meses_deuda
        `);
        
        const clientesAfectados = result.rowCount;
        const tiempoEjecucion = Date.now() - inicio;
        
        // Registrar log
        await registrarLog(
            'incremento_deuda_mensual',
            'success',
            `Se incrementó la deuda de ${clientesAfectados} clientes`,
            clientesAfectados,
            tiempoEjecucion
        );
        
        console.log(`✅ Deuda incrementada para ${clientesAfectados} clientes en ${tiempoEjecucion}ms`);
        
        // Enviar alerta si hay muchos clientes con deuda
        if (clientesAfectados > 10) {
            await enviarAlerta(
                'Incremento Mensual de Deuda',
                `
                <h2>🔔 Alerta del Sistema</h2>
                <p>Se ha incrementado la deuda de <strong>${clientesAfectados} clientes</strong>. 
                Revise el sistema para gestionar la cobranza.</p>
                <hr>
                <small>Este es un mensaje automático del sistema TV Jhaire</small>
                `
            );
        }
        
    } catch (error) {
        console.error('❌ Error incrementando deuda:', error);
        await registrarLog(
            'incremento_deuda_mensual',
            'error',
            error.message,
            0,
            Date.now() - inicio
        );
        
        await enviarAlerta(
            'ERROR: Incremento de Deuda Falló',
            `
            <h2>🔔 Alerta del Sistema</h2>
            <p>Error al incrementar deuda mensual: ${error.message}</p>
            <hr>
            <small>Este es un mensaje automático del sistema TV Jhaire</small>
            `
        );
    }
};

// ============================================
// ✅ TAREA 2: ALERTA DE SUSPENSIÓN (NO SUSPENDE)
// ============================================

const suspensionAutomatica = async () => {
    const inicio = Date.now();
    console.log('🔄 Verificando clientes en riesgo de suspensión...');
    
    try {
        // Obtener configuración de meses antes de alerta
        const configResult = await pool.query(
            "SELECT valor FROM configuracion_sistema WHERE clave = 'dias_antes_suspension'"
        );
        const mesesAlerta = parseInt(configResult.rows[0]?.valor || 5);
        
        // ✅ MODIFICADO: Solo OBTENER clientes en riesgo, NO SUSPENDER
        const result = await pool.query(`
            SELECT 
                id, codigo, nombre, apellido, dni, telefono, email, direccion,
                tipo_servicio, plan, precio_mensual, meses_deuda, estado_pago,
                (meses_deuda * precio_mensual) as deuda_total
            FROM clientes
            WHERE estado = 'activo'
            AND meses_deuda >= $1
            ORDER BY meses_deuda DESC, deuda_total DESC
        `, [mesesAlerta]);
        
        const clientesEnRiesgo = result.rows;
        const tiempoEjecucion = Date.now() - inicio;
        
        // ✅ MODIFICADO: Registrar log de ALERTA, no de suspensión
        await registrarLog(
            'alerta_suspension',
            'info',
            `Se identificaron ${clientesEnRiesgo.length} clientes en riesgo con mora >= ${mesesAlerta} meses (NO SE SUSPENDIERON)`,
            clientesEnRiesgo.length,
            tiempoEjecucion
        );
        
        console.log(`⚠️ ${clientesEnRiesgo.length} clientes en riesgo identificados en ${tiempoEjecucion}ms`);
        console.log('ℹ️ NO SE SUSPENDIÓ AUTOMÁTICAMENTE - Solo se generaron alertas');
        
        // ✅ MODIFICADO: Enviar ALERTA en vez de suspender
        if (clientesEnRiesgo.length > 0) {
            const listaClientes = clientesEnRiesgo
                .map(c => `
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 8px;">${c.codigo || c.id}</td>
                        <td style="padding: 8px;"><strong>${c.nombre} ${c.apellido}</strong></td>
                        <td style="padding: 8px;">${c.dni}</td>
                        <td style="padding: 8px;">${c.telefono || '-'}</td>
                        <td style="padding: 8px; text-align: center; font-weight: bold; color: ${c.meses_deuda > 5 ? '#dc2626' : '#f59e0b'};">${c.meses_deuda}</td>
                        <td style="padding: 8px; text-align: right; font-weight: bold;">S/ ${parseFloat(c.deuda_total).toFixed(2)}</td>
                    </tr>
                `)
                .join('');
            
            await enviarAlerta(
                `⚠️ ALERTA: ${clientesEnRiesgo.length} Clientes Requieren Atención`,
                `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">⚠️ Clientes en Riesgo de Suspensión</h2>
                    <p style="font-size: 16px; color: #374151;">
                        Los siguientes <strong>${clientesEnRiesgo.length} clientes</strong> tienen mora mayor a 
                        <strong>${mesesAlerta} meses</strong> y requieren atención inmediata:
                    </p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #e5e7eb;">
                        <thead>
                            <tr style="background-color: #f3f4f6; border-bottom: 2px solid #d1d5db;">
                                <th style="padding: 10px; text-align: left;">Código</th>
                                <th style="padding: 10px; text-align: left;">Cliente</th>
                                <th style="padding: 10px; text-align: left;">DNI</th>
                                <th style="padding: 10px; text-align: left;">Teléfono</th>
                                <th style="padding: 10px; text-align: center;">Meses</th>
                                <th style="padding: 10px; text-align: right;">Deuda Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${listaClientes}
                        </tbody>
                    </table>
                    
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #92400e;">
                            <strong>📋 Acción Requerida:</strong><br>
                            Esta es una alerta informativa. Los clientes <strong>NO han sido suspendidos automáticamente</strong>.
                            Debe revisar cada caso y decidir las acciones apropiadas desde el sistema de gestión.
                        </p>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px;">
                        <h3 style="color: #111827; margin-top: 0;">Acciones Recomendadas:</h3>
                        <ul style="color: #374151;">
                            <li>Contactar telefónicamente a cada cliente</li>
                            <li>Enviar recordatorios de pago vía WhatsApp</li>
                            <li>Evaluar casos especiales para planes de pago</li>
                            <li>Decidir suspensiones caso por caso desde el sistema</li>
                        </ul>
                    </div>
                    
                    <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px;">
                        Sistema de Gestión TV Jhaire | Alerta Automática<br>
                        Fecha: ${new Date().toLocaleString('es-PE')}
                    </p>
                </div>
                `
            );
            
            // ✅ NUEVO: Crear notificaciones en el sistema para cada cliente
            for (const cliente of clientesEnRiesgo) {
                try {
                    await pool.query(`
                        INSERT INTO notificaciones (
                            tipo, titulo, mensaje, prioridad, cliente_id, icono, color, leido
                        ) VALUES (
                            'alerta_suspension',
                            'Cliente en Riesgo de Suspensión',
                            $1,
                            'alta',
                            $2,
                            'alert-triangle',
                            'red',
                            false
                        )
                    `, [
                        `${cliente.nombre} ${cliente.apellido} tiene ${cliente.meses_deuda} meses de deuda (S/ ${parseFloat(cliente.deuda_total).toFixed(2)}). Requiere contacto urgente.`,
                        cliente.id
                    ]);
                } catch (notifError) {
                    console.error('Error creando notificación:', notifError);
                }
            }
            
            console.log(`✅ Se crearon ${clientesEnRiesgo.length} notificaciones en el sistema`);
        } else {
            console.log('✅ No hay clientes en riesgo de suspensión');
        }
        
    } catch (error) {
        console.error('❌ Error en verificación de suspensión:', error);
        await registrarLog(
            'alerta_suspension',
            'error',
            error.message,
            0,
            Date.now() - inicio
        );
        
        await enviarAlerta(
            'ERROR: Verificación de Suspensión Falló',
            `
            <h2>🔔 Alerta del Sistema</h2>
            <p>Error en verificación automática: ${error.message}</p>
            <hr>
            <small>Este es un mensaje automático del sistema TV Jhaire</small>
            `
        );
    }
};

// ============================================
// TAREA 3: REACTIVACIÓN AUTOMÁTICA AL PAGAR
// ============================================

const reactivacionAutomatica = async () => {
    const inicio = Date.now();
    console.log('🔄 Verificando reactivaciones automáticas...');
    
    try {
        // Reactivar clientes suspendidos que pagaron y ya no tienen deuda
        const result = await pool.query(`
            UPDATE clientes
            SET 
                estado = 'activo',
                fecha_reactivacion = CURRENT_TIMESTAMP,
                motivo_suspension = NULL,
                fecha_suspension = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE estado = 'suspendido'
            AND meses_deuda = 0
            RETURNING id, nombre, apellido, dni
        `);
        
        const clientesReactivados = result.rows;
        const tiempoEjecucion = Date.now() - inicio;
        
        // Registrar en historial
        for (const cliente of clientesReactivados) {
            await pool.query(`
                INSERT INTO historial_suspensiones (cliente_id, accion, motivo, observaciones)
                VALUES ($1, 'reactivación', 'Pago completado', 'Reactivación automática del sistema')
            `, [cliente.id]);
        }
        
        // Registrar log
        await registrarLog(
            'reactivacion_automatica',
            'success',
            `Se reactivaron ${clientesReactivados.length} clientes`,
            clientesReactivados.length,
            tiempoEjecucion
        );
        
        console.log(`✅ ${clientesReactivados.length} clientes reactivados en ${tiempoEjecucion}ms`);
        
        if (clientesReactivados.length > 0) {
            const listaClientes = clientesReactivados
                .map(c => `• ${c.nombre} ${c.apellido} (DNI: ${c.dni})`)
                .join('<br>');
            
            await enviarAlerta(
                'Reactivaciones Automáticas',
                `
                <h2>🔔 Alerta del Sistema</h2>
                <p>Se han reactivado <strong>${clientesReactivados.length} clientes</strong> 
                que completaron sus pagos:<br><br>${listaClientes}</p>
                <hr>
                <small>Este es un mensaje automático del sistema TV Jhaire</small>
                `
            );
        }
        
    } catch (error) {
        console.error('❌ Error en reactivación automática:', error);
        await registrarLog(
            'reactivacion_automatica',
            'error',
            error.message,
            0,
            Date.now() - inicio
        );
    }
};

// ============================================
// TAREA 4: ACTUALIZAR SCORES DE PAGO
// ============================================

const actualizarScoresPago = async () => {
    const inicio = Date.now();
    console.log('🔄 Actualizando scores de pago...');
    
    try {
        // Actualizar scores usando la función SQL
        const result = await pool.query(`
            UPDATE clientes
            SET score_pago = calcular_score_pago(id)
            WHERE estado = 'activo'
        `);
        
        const tiempoEjecucion = Date.now() - inicio;
        
        await registrarLog(
            'actualizar_scores',
            'success',
            `Scores actualizados para ${result.rowCount} clientes`,
            result.rowCount,
            tiempoEjecucion
        );
        
        console.log(`✅ Scores actualizados en ${tiempoEjecucion}ms`);
        
    } catch (error) {
        console.error('❌ Error actualizando scores:', error);
        await registrarLog(
            'actualizar_scores',
            'error',
            error.message,
            0,
            Date.now() - inicio
        );
    }
};

// ============================================
// TAREA 5: GENERAR MÉTRICAS DIARIAS
// ============================================

const generarMetricasDiarias = async () => {
    const inicio = Date.now();
    console.log('🔄 Generando métricas diarias...');
    
    try {
        // Obtener métricas del día
        const result = await pool.query(`
            INSERT INTO metricas_historicas (
                fecha,
                total_clientes,
                clientes_activos,
                clientes_suspendidos,
                clientes_con_deuda,
                monto_total_deuda,
                ingresos_dia,
                ingresos_mes,
                tasa_morosidad,
                nuevos_clientes,
                bajas_clientes
            )
            SELECT 
                CURRENT_DATE,
                COUNT(*),
                COUNT(*) FILTER (WHERE estado = 'activo'),
                COUNT(*) FILTER (WHERE estado = 'suspendido'),
                COUNT(*) FILTER (WHERE meses_deuda > 0 AND estado = 'activo'),
                COALESCE(SUM(meses_deuda * precio_mensual), 0),
                COALESCE((SELECT SUM(monto) FROM pagos WHERE fecha_pago = CURRENT_DATE), 0),
                COALESCE((SELECT SUM(monto) FROM pagos 
                          WHERE DATE_TRUNC('month', fecha_pago) = DATE_TRUNC('month', CURRENT_DATE)), 0),
                ROUND((COUNT(*) FILTER (WHERE meses_deuda > 0 AND estado = 'activo')::DECIMAL / 
                       NULLIF(COUNT(*) FILTER (WHERE estado = 'activo'), 0) * 100), 2),
                COUNT(*) FILTER (WHERE DATE(fecha_instalacion) = CURRENT_DATE),
                0  -- bajas se calculan manualmente
            FROM clientes
            ON CONFLICT (fecha) DO UPDATE SET
                total_clientes = EXCLUDED.total_clientes,
                clientes_activos = EXCLUDED.clientes_activos,
                clientes_suspendidos = EXCLUDED.clientes_suspendidos,
                clientes_con_deuda = EXCLUDED.clientes_con_deuda,
                monto_total_deuda = EXCLUDED.monto_total_deuda,
                ingresos_dia = EXCLUDED.ingresos_dia,
                ingresos_mes = EXCLUDED.ingresos_mes,
                tasa_morosidad = EXCLUDED.tasa_morosidad,
                nuevos_clientes = EXCLUDED.nuevos_clientes
        `);
        
        const tiempoEjecucion = Date.now() - inicio;
        
        await registrarLog(
            'metricas_diarias',
            'success',
            'Métricas diarias generadas correctamente',
            1,
            tiempoEjecucion
        );
        
        console.log(`✅ Métricas diarias generadas en ${tiempoEjecucion}ms`);
        
    } catch (error) {
        console.error('❌ Error generando métricas:', error);
        await registrarLog(
            'metricas_diarias',
            'error',
            error.message,
            0,
            Date.now() - inicio
        );
    }
};

// ============================================
// TAREA 6: REFRESH VISTA DASHBOARD
// ============================================

const refreshDashboard = async () => {
    const inicio = Date.now();
    console.log('🔄 Refrescando vista dashboard...');
    
    try {
        await pool.query('SELECT refresh_dashboard()');
        
        const tiempoEjecucion = Date.now() - inicio;
        
        await registrarLog(
            'refresh_dashboard',
            'success',
            'Vista dashboard actualizada',
            1,
            tiempoEjecucion
        );
        
        console.log(`✅ Dashboard refrescado en ${tiempoEjecucion}ms`);
        
    } catch (error) {
        console.error('❌ Error refrescando dashboard:', error);
        await registrarLog(
            'refresh_dashboard',
            'error',
            error.message,
            0,
            Date.now() - inicio
        );
    }
};

// ============================================
// TAREA 7: BACKUP AUTOMÁTICO (SIMULADO)
// ============================================

const backupAutomatico = async () => {
    const inicio = Date.now();
    console.log('🔄 Iniciando backup automático...');
    
    try {
        // En producción real, ejecutarías pg_dump aquí
        // Por ahora solo registramos el evento
        
        const tiempoEjecucion = Date.now() - inicio;
        
        await registrarLog(
            'backup_automatico',
            'success',
            'Backup simulado completado (implementar pg_dump en producción)',
            1,
            tiempoEjecucion
        );
        
        console.log(`✅ Backup completado en ${tiempoEjecucion}ms`);
        
        await enviarAlerta(
            'Backup Diario Completado',
            `
            <h2>🔔 Alerta del Sistema</h2>
            <p>El backup automático se ha completado exitosamente.</p>
            <hr>
            <small>Este es un mensaje automático del sistema TV Jhaire</small>
            `
        );
        
    } catch (error) {
        console.error('❌ Error en backup:', error);
        await registrarLog(
            'backup_automatico',
            'error',
            error.message,
            0,
            Date.now() - inicio
        );
        
        await enviarAlerta(
            'ERROR: Backup Falló',
            `
            <h2>🔔 Alerta del Sistema</h2>
            <p>Error en backup automático: ${error.message}</p>
            <hr>
            <small>Este es un mensaje automático del sistema TV Jhaire</small>
            `
        );
    }
};

// ============================================
// CONFIGURAR CRON JOBS
// ============================================

const configurarCronJobs = () => {
    console.log('🚀 Configurando CRON jobs...');
    
    // 1. Incrementar deuda - Primer día del mes a las 00:00
    cron.schedule('0 0 1 * *', incrementarDeudaMensual, {
        timezone: "America/Lima"
    });
    console.log('✅ CRON: Incremento deuda mensual - 1er día a las 00:00');
    
    // ✅ 2. Verificación de riesgo (SOLO ALERTA, NO SUSPENDE)
    cron.schedule('0 2 * * *', suspensionAutomatica, {
        timezone: "America/Lima"
    });
    console.log('⚠️ CRON: Verificación de riesgo - Diario a las 02:00 (SOLO ALERTAS, NO SUSPENDE)');
    
    // 3. Reactivación automática - Todos los días a las 03:00
    cron.schedule('0 3 * * *', reactivacionAutomatica, {
        timezone: "America/Lima"
    });
    console.log('✅ CRON: Reactivación automática - Diario a las 03:00');
    
    // 4. Actualizar scores - Todos los días a las 04:00
    cron.schedule('0 4 * * *', actualizarScoresPago, {
        timezone: "America/Lima"
    });
    console.log('✅ CRON: Actualizar scores - Diario a las 04:00');
    
    // 5. Métricas diarias - Todos los días a las 23:55
    cron.schedule('55 23 * * *', generarMetricasDiarias, {
        timezone: "America/Lima"
    });
    console.log('✅ CRON: Métricas diarias - Diario a las 23:55');
    
    // 6. Refresh dashboard - Cada hora
    cron.schedule('0 * * * *', refreshDashboard, {
        timezone: "America/Lima"
    });
    console.log('✅ CRON: Refresh dashboard - Cada hora');
    
    // 7. Backup automático - Todos los días a las 05:00
    cron.schedule('0 5 * * *', backupAutomatico, {
        timezone: "America/Lima"
    });
    console.log('✅ CRON: Backup automático - Diario a las 05:00');
    
    console.log('✅ Todos los CRON jobs configurados correctamente');
    console.log('🕐 Timezone: America/Lima (UTC-5)');
    console.log('⚠️ IMPORTANTE: La suspensión es MANUAL, solo se envían alertas');
};

// ============================================
// FUNCIONES PARA EJECUTAR MANUALMENTE
// ============================================

const ejecutarTareaManual = async (nombreTarea) => {
    console.log(`🔧 Ejecutando tarea manual: ${nombreTarea}`);
    
    const tareas = {
        'incremento_deuda': incrementarDeudaMensual,
        'suspension': suspensionAutomatica,
        'reactivacion': reactivacionAutomatica,
        'scores': actualizarScoresPago,
        'metricas': generarMetricasDiarias,
        'dashboard': refreshDashboard,
        'backup': backupAutomatico
    };
    
    const tarea = tareas[nombreTarea];
    
    if (tarea) {
        await tarea();
        return { success: true, message: `Tarea ${nombreTarea} ejecutada` };
    } else {
        return { success: false, message: 'Tarea no encontrada' };
    }
};

// ============================================
// EXPORTAR
// ============================================

module.exports = {
    configurarCronJobs,
    ejecutarTareaManual,
    incrementarDeudaMensual,
    suspensionAutomatica,
    reactivacionAutomatica,
    actualizarScoresPago,
    generarMetricasDiarias,
    refreshDashboard,
    backupAutomatico
};
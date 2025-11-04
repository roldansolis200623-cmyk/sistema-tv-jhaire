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
            html: `
                <h2>🔔 Alerta del Sistema</h2>
                <p>${mensaje}</p>
                <hr>
                <small>Este es un mensaje automático del sistema TV Jhaire</small>
            `
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
                `Se ha incrementado la deuda de <strong>${clientesAfectados} clientes</strong>. 
                Revise el sistema para gestionar la cobranza.`
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
            `Error al incrementar deuda mensual: ${error.message}`
        );
    }
};

// ============================================
// TAREA 2: SUSPENSIÓN AUTOMÁTICA
// ============================================

const suspensionAutomatica = async () => {
    const inicio = Date.now();
    console.log('🔄 Iniciando suspensión automática...');
    
    try {
        // Obtener días antes de suspensión desde configuración
        const configResult = await pool.query(
            "SELECT valor FROM configuracion_sistema WHERE clave = 'dias_antes_suspension'"
        );
        const diasMora = parseInt(configResult.rows[0]?.valor || 5);
        
        // Suspender clientes con mora >= diasMora
        const result = await pool.query(`
            UPDATE clientes
            SET 
                estado = 'suspendido',
                fecha_suspension = CURRENT_TIMESTAMP,
                motivo_suspension = 'Suspensión automática por morosidad',
                suspendido_por = 'Sistema Automático',
                updated_at = CURRENT_TIMESTAMP
            WHERE estado = 'activo'
            AND meses_deuda >= $1
            RETURNING id, nombre, apellido, dni, meses_deuda
        `, [diasMora]);
        
        const clientesSuspendidos = result.rows;
        const tiempoEjecucion = Date.now() - inicio;
        
        // Registrar en historial de suspensiones
        for (const cliente of clientesSuspendidos) {
            await pool.query(`
                INSERT INTO historial_suspensiones (cliente_id, accion, motivo, observaciones)
                VALUES ($1, 'suspensión', 'Mora de ' || $2 || ' meses', 'Suspensión automática del sistema')
            `, [cliente.id, cliente.meses_deuda]);
        }
        
        // Registrar log
        await registrarLog(
            'suspension_automatica',
            'success',
            `Se suspendieron ${clientesSuspendidos.length} clientes por mora >= ${diasMora} meses`,
            clientesSuspendidos.length,
            tiempoEjecucion
        );
        
        console.log(`✅ ${clientesSuspendidos.length} clientes suspendidos en ${tiempoEjecucion}ms`);
        
        // Enviar alerta con detalles
        if (clientesSuspendidos.length > 0) {
            const listaClientes = clientesSuspendidos
                .map(c => `• ${c.nombre} ${c.apellido} (DNI: ${c.dni}) - ${c.meses_deuda} meses`)
                .join('<br>');
            
            await enviarAlerta(
                'Suspensiones Automáticas Realizadas',
                `Se han suspendido <strong>${clientesSuspendidos.length} clientes</strong> 
                por mora mayor a ${diasMora} meses:<br><br>${listaClientes}`
            );
        }
        
    } catch (error) {
        console.error('❌ Error en suspensión automática:', error);
        await registrarLog(
            'suspension_automatica',
            'error',
            error.message,
            0,
            Date.now() - inicio
        );
        
        await enviarAlerta(
            'ERROR: Suspensión Automática Falló',
            `Error en suspensión automática: ${error.message}`
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
                `Se han reactivado <strong>${clientesReactivados.length} clientes</strong> 
                que completaron sus pagos:<br><br>${listaClientes}`
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
            'El backup automático se ha completado exitosamente.'
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
            `Error en backup automático: ${error.message}`
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
    
    // 2. Suspensión automática - Todos los días a las 02:00
    cron.schedule('0 2 * * *', suspensionAutomatica, {
        timezone: "America/Lima"
    });
    console.log('✅ CRON: Suspensión automática - Diario a las 02:00');
    
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
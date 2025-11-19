// ============================================
// backend/src/services/cronService.js
// SERVICIO DE AUTOMATIZACIÓN CON CRON JOBS
// ✅ CORREGIDO: Sin suspensión automática
// ✅ OPTIMIZADO: Usa notificaciones inteligentes
// ============================================

const cron = require('node-cron');
const pool = require('../config/database');
const nodemailer = require('nodemailer');
const notificacionInteligenteService = require('./notificacionInteligenteService');

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
// TAREA: INCREMENTAR DEUDA MENSUALMENTE
// ============================================

const incrementarDeudaMensual = async () => {
    const inicio = Date.now();
    console.log('🔄 Incrementando deuda mensual...');
    
    try {
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
        
        await registrarLog(
            'incremento_deuda_mensual',
            'success',
            `Se incrementó la deuda de ${clientesAfectados} clientes`,
            clientesAfectados,
            tiempoEjecucion
        );
        
        console.log(`✅ Deuda incrementada para ${clientesAfectados} clientes`);
        
    } catch (error) {
        console.error('❌ Error en incrementarDeudaMensual:', error);
        await registrarLog(
            'incremento_deuda_mensual',
            'error',
            error.message,
            0,
            Date.now() - inicio
        );
    }
};

// ============================================
// ✅✅✅ SOLUCIÓN 3: VERIFICAR DEUDA ALTA
// NO SUSPENDE AUTOMÁTICAMENTE, SOLO NOTIFICA
// ============================================

const verificarClientesConDeudaAlta = async () => {
    const inicio = Date.now();
    console.log('🔍 Verificando clientes con deuda ALTA...');
    
    try {
        // Obtener clientes con deuda > 5 meses
        const result = await pool.query(`
            SELECT 
                id, 
                nombre, 
                apellido, 
                meses_deuda,
                email,
                telefono,
                precio_mensual,
                COALESCE(deuda_total, 0) as deuda_total,
                COALESCE(fecha_ultimo_pago, fecha_instalacion) as ultima_fecha
            FROM clientes 
            WHERE estado = 'activo' 
            AND meses_deuda > 5
            ORDER BY meses_deuda DESC
        `);

        console.log(`ℹ️ Encontrados ${result.rows.length} clientes con deuda > 5 meses`);

        let notificacionesCreadas = 0;
        
        // ✅ CREAR NOTIFICACIONES (NO SUSPENDER AUTOMÁTICAMENTE)
        for (const cliente of result.rows) {
            try {
                // Verificar si ya existe notificación reciente (últimas 24 horas)
                const existeNotif = await pool.query(`
                    SELECT id FROM notificaciones_inteligentes
                    WHERE cliente_id = $1
                    AND tipo = 'ALERTA_DEUDA_ALTA'
                    AND fecha_creacion > CURRENT_TIMESTAMP - INTERVAL '24 hours'
                    LIMIT 1
                `, [cliente.id]);
                
                if (existeNotif.rows.length > 0) {
                    console.log(`  ⏭️  ${cliente.nombre}: Ya existe notificación reciente`);
                    continue;
                }

                // Determinar prioridad según deuda
                let prioridad = 'HIGH';
                if (cliente.meses_deuda > 10) {
                    prioridad = 'CRITICAL';
                } else if (cliente.meses_deuda > 8) {
                    prioridad = 'CRITICAL';
                }

                // Crear notificación inteligente
                await pool.query(`
                    INSERT INTO notificaciones_inteligentes (
                        cliente_id,
                        tipo,
                        prioridad,
                        titulo,
                        mensaje,
                        deuda_actual,
                        dias_sin_pagar,
                        patron_detectado,
                        accion_sugerida,
                        leida,
                        fecha_creacion,
                        origen
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, CURRENT_TIMESTAMP, $10)
                `, [
                    cliente.id,
                    'ALERTA_DEUDA_ALTA',
                    prioridad,
                    `⚠️ ALERTA CRÍTICA - Deuda de ${cliente.meses_deuda} meses`,
                    `${cliente.nombre} ${cliente.apellido} debe ${cliente.meses_deuda} meses. Deuda total: S/ ${cliente.deuda_total}. REQUIERE ATENCIÓN INMEDIATA - Riesgo de suspensión de servicio si no regulariza el pago`,
                    cliente.deuda_total || 0,
                    Math.floor((Date.now() - new Date(cliente.ultima_fecha || new Date().getTime()).getTime()) / (1000 * 60 * 60 * 24)),
                    cliente.meses_deuda,
                    cliente.meses_deuda > 8 ? 'CONTACTO URGENTE Y CONSIDERACIÓN DE SUSPENSIÓN' : 'Contactar cliente urgentemente para negociar plan de pago',
                    'contactar-deudor'
                ]);

                // También crear en tabla notificaciones normal (para dashboard)
                await pool.query(`
                    INSERT INTO notificaciones (
                        tipo,
                        titulo,
                        mensaje,
                        cliente_id,
                        prioridad,
                        leida,
                        fecha_creacion
                    ) VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP)
                `, [
                    'DEUDA_CRITICA',
                    `⚠️ DEUDA ALTA: ${cliente.nombre}`,
                    `Deuda de ${cliente.meses_deuda} meses. Total: S/ ${cliente.deuda_total}`,
                    cliente.id,
                    prioridad
                ]);

                notificacionesCreadas++;
                console.log(`  ✅ Notificación creada para ${cliente.nombre} (deuda: ${cliente.meses_deuda} meses, prioridad: ${prioridad})`);

            } catch (notifError) {
                console.error(`  ❌ Error creando notificación para cliente ${cliente.id}:`, notifError.message);
            }
        }

        const tiempoEjecucion = Date.now() - inicio;
        
        // Registrar en logs
        await registrarLog(
            'verificar_deuda_alta',
            'success',
            `Se crearon ${notificacionesCreadas} notificaciones de alerta para clientes con deuda alta`,
            notificacionesCreadas,
            tiempoEjecucion
        );

        console.log(`✅ Verificación completada en ${tiempoEjecucion}ms. ${notificacionesCreadas} notificaciones creadas`);

    } catch (error) {
        const tiempoEjecucion = Date.now() - inicio;
        console.error('❌ Error en verificarClientesConDeudaAlta:', error);
        await registrarLog(
            'verificar_deuda_alta',
            'error',
            error.message,
            0,
            tiempoEjecucion
        );
    }
};

// ============================================
// TAREA: LIMPIAR NOTIFICACIONES ANTIGUAS
// ============================================

const limpiarNotificacionesAntiguas = async () => {
    const inicio = Date.now();
    console.log('🧹 Limpiando notificaciones antiguas...');
    
    try {
        const result = await pool.query(`
            DELETE FROM notificaciones
            WHERE fecha_creacion < CURRENT_TIMESTAMP - INTERVAL '30 days'
            RETURNING id
        `);
        
        const tiempoEjecucion = Date.now() - inicio;
        
        await registrarLog(
            'limpiar_notificaciones',
            'success',
            `Se eliminaron ${result.rowCount} notificaciones antiguas`,
            result.rowCount,
            tiempoEjecucion
        );
        
        console.log(`✅ ${result.rowCount} notificaciones antiguas eliminadas`);
        
    } catch (error) {
        console.error('❌ Error limpiando notificaciones:', error);
        await registrarLog(
            'limpiar_notificaciones',
            'error',
            error.message,
            0,
            Date.now() - inicio
        );
    }
};

// ============================================
// TAREA: ARCHIVOS AUTOMATICOS DE TAREAS
// ============================================

const archivarTareasVencidas = async () => {
    const inicio = Date.now();
    console.log('📦 Archivando tareas vencidas...');
    
    try {
        const result = await pool.query(`
            UPDATE tareas
            SET 
                estado = 'cancelada',
                fecha_cancelada = CURRENT_TIMESTAMP
            WHERE estado = 'pendiente'
            AND fecha_vencimiento < CURRENT_DATE
            RETURNING id
        `);
        
        const tiempoEjecucion = Date.now() - inicio;
        
        await registrarLog(
            'archivar_tareas_vencidas',
            'success',
            `Se archivaron ${result.rowCount} tareas vencidas`,
            result.rowCount,
            tiempoEjecucion
        );
        
        console.log(`✅ ${result.rowCount} tareas vencidas archivadas`);
        
    } catch (error) {
        console.error('❌ Error archivando tareas:', error);
        await registrarLog(
            'archivar_tareas_vencidas',
            'error',
            error.message,
            0,
            Date.now() - inicio
        );
    }
};

// ============================================
// TAREA: GENERAR MÉTRICAS HISTÓRICAS
// ============================================

const generarMetricasHistoricas = async () => {
    const inicio = Date.now();
    console.log('📊 Generando métricas históricas...');
    
    try {
        // Obtener datos actuales
        const statsResult = await pool.query(`
            SELECT 
                COUNT(*) as total_clientes,
                COUNT(*) FILTER (WHERE estado = 'activo') as clientes_activos,
                COUNT(*) FILTER (WHERE estado = 'suspendido') as clientes_suspendidos,
                COUNT(*) FILTER (WHERE meses_deuda > 0) as clientes_con_deuda,
                COALESCE(SUM(deuda_total), 0) as deuda_total,
                ROUND(
                    COUNT(*) FILTER (WHERE meses_deuda > 0) * 100.0 / 
                    NULLIF(COUNT(*), 0), 
                    2
                ) as tasa_morosidad
            FROM clientes
        `);
        
        const stats = statsResult.rows[0];
        
        // Insertar en metricas_historicas
        await pool.query(`
            INSERT INTO metricas_historicas (
                fecha,
                total_clientes,
                clientes_activos,
                clientes_suspendidos,
                clientes_con_deuda,
                monto_total_deuda,
                tasa_morosidad
            ) VALUES (
                CURRENT_DATE,
                $1, $2, $3, $4, $5, $6
            )
        `, [
            stats.total_clientes,
            stats.clientes_activos,
            stats.clientes_suspendidos,
            stats.clientes_con_deuda,
            stats.deuda_total,
            stats.tasa_morosidad
        ]);
        
        const tiempoEjecucion = Date.now() - inicio;
        
        await registrarLog(
            'generar_metricas',
            'success',
            `Métricas generadas: ${stats.total_clientes} clientes, S/ ${stats.deuda_total} deuda`,
            1,
            tiempoEjecucion
        );
        
        console.log(`✅ Métricas generadas: ${stats.total_clientes} clientes activos, ${stats.clientes_con_deuda} con deuda`);
        
    } catch (error) {
        console.error('❌ Error generando métricas:', error);
        await registrarLog(
            'generar_metricas',
            'error',
            error.message,
            0,
            Date.now() - inicio
        );
    }
};

// ============================================
// CONTROLADOR PRINCIPAL DE CRON JOBS
// ============================================

const cronService = {
    // Inicializar todos los CRON JOBS
    iniciarTareas: () => {
        console.log('⏰ Inicializando CRON JOBS...\n');

        // 1️⃣ Incrementar deuda cada 1º de mes a las 1:00 AM
        cron.schedule('0 1 1 * *', () => {
            console.log('\n⏰ [01:00] Ejecutando: Incrementar deuda mensual');
            incrementarDeudaMensual();
        });

        // 2️⃣ OPTIMIZADO: Generar notificaciones inteligentes cada 30 minutos
        cron.schedule('*/30 * * * *', async () => {
            console.log('\n⏰ [Cada 30min] Ejecutando: Generar notificaciones inteligentes');
            try {
                await notificacionInteligenteService.generarNotificacionesInteligentes();
            } catch (error) {
                console.error('❌ Error generando notificaciones inteligentes:', error);
            }
        });

        // 3️⃣ Limpiar notificaciones viejas cada domingo a las 2:00 AM
        cron.schedule('0 2 * * 0', () => {
            console.log('\n⏰ [02:00 Domingo] Ejecutando: Limpiar notificaciones antiguas');
            limpiarNotificacionesAntiguas();
        });

        // 4️⃣ Archivar tareas vencidas cada día a las 3:00 AM
        cron.schedule('0 3 * * *', () => {
            console.log('\n⏰ [03:00] Ejecutando: Archivar tareas vencidas');
            archivarTareasVencidas();
        });

        // 5️⃣ Generar métricas cada día a las 11:59 PM
        cron.schedule('59 23 * * *', () => {
            console.log('\n⏰ [23:59] Ejecutando: Generar métricas históricas');
            generarMetricasHistoricas();
        });

        console.log('✅ CRON JOBS inicializados correctamente\n');
        console.log('📅 Tareas programadas:');
        console.log('  1️⃣ 01:00 del 1º - Incrementar deuda mensual');
        console.log('  2️⃣ Cada 30 minutos - Generar notificaciones inteligentes (OPTIMIZADO)');
        console.log('  3️⃣ 02:00 domingo - Limpiar notificaciones antiguas');
        console.log('  4️⃣ 03:00 diario - Archivar tareas vencidas');
        console.log('  5️⃣ 23:59 diario - Generar métricas\n');
    },

    // Ejecutar tareas manualmente (útil para testing)
    ejecutarManualmente: {
        incrementarDeuda: incrementarDeudaMensual,
        verificarDeudaAlta: verificarClientesConDeudaAlta,
        limpiarNotificaciones: limpiarNotificacionesAntiguas,
        archivarTareas: archivarTareasVencidas,
        generarMetricas: generarMetricasHistoricas,
        generarNotificacionesInteligentes: () => notificacionInteligenteService.generarNotificacionesInteligentes()
    }
};

module.exports = {
    ...cronService,
    configurarCronJobs: cronService.iniciarTareas
};
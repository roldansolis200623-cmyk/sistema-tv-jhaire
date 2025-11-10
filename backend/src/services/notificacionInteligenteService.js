// ============================================
// backend/src/services/notificacionInteligenteService.js
// SERVICIO DE NOTIFICACIONES INTELIGENTES
// ✅ GENERACIÓN AUTOMÁTICA EN TIEMPO REAL
// ============================================

const pool = require('../config/database');

const notificacionInteligenteService = {
    /**
     * ✅ Generar TODAS las notificaciones inteligentes en tiempo real
     */
    async generarNotificacionesInteligentes() {
        console.log('🤖 ===== GENERANDO NOTIFICACIONES INTELIGENTES =====');
        
        try {
            const inicio = Date.now();
            
            let totalCreadas = 0;
            
            // 1️⃣ Alertas de deuda crítica
            console.log('1️⃣ Generando alertas de deuda crítica...');
            const deudaCritica = await this.alertarDeudaCritica();
            totalCreadas += deudaCritica;
            
            // 2️⃣ Detectar patrones de pago
            console.log('2️⃣ Detectando patrones de pago...');
            const patrones = await this.detectarPatronesPago();
            totalCreadas += patrones;
            
            // 3️⃣ Alertas de próximo vencimiento
            console.log('3️⃣ Alertando sobre próximos vencimientos...');
            const vencimientos = await this.alertarProximoVencimiento();
            totalCreadas += vencimientos;
            
            // 4️⃣ Clientes nuevos sin pago
            console.log('4️⃣ Alertando clientes nuevos sin pago...');
            const nuevosSinPago = await this.alertarClientesNuevosSinPago();
            totalCreadas += nuevosSinPago;
            
            // 5️⃣ Clientes que recuperaron estado
            console.log('5️⃣ Notificando clientes que mejoraron...');
            const mejoraron = await this.notificarClientesQueMejoraron();
            totalCreadas += mejoraron;
            
            const tiempoTotal = Date.now() - inicio;
            
            console.log(`\n✅ NOTIFICACIONES GENERADAS EN ${tiempoTotal}ms`);
            console.log(`   → Deuda crítica: ${deudaCritica}`);
            console.log(`   → Patrones: ${patrones}`);
            console.log(`   → Vencimientos: ${vencimientos}`);
            console.log(`   → Nuevos sin pago: ${nuevosSinPago}`);
            console.log(`   → Mejoraron: ${mejoraron}`);
            console.log(`   📊 TOTAL: ${totalCreadas} notificaciones\n`);
            
            return totalCreadas;
            
        } catch (error) {
            console.error('❌ Error generando notificaciones inteligentes:', error);
            throw error;
        }
    },

    /**
     * 1️⃣ ALERTAS DE DEUDA CRÍTICA
     */
    async alertarDeudaCritica() {
        try {
            let notificacionesCreadas = 0;
            
            const clientes = await pool.query(`
                SELECT 
                    id, nombre, apellido, meses_deuda, deuda_total, 
                    email, telefono, fecha_ultimo_pago
                FROM clientes 
                WHERE estado = 'activo' AND meses_deuda >= 3
                ORDER BY meses_deuda DESC
            `);
            
            for (const cliente of clientes.rows) {
                try {
                    // Verificar si ya existe notificación HOYY
                    const existe = await pool.query(`
                        SELECT id FROM notificaciones_inteligentes 
                        WHERE cliente_id = $1 
                        AND tipo = 'DEUDA_CRITICA'
                        AND DATE(fecha_creacion) = CURRENT_DATE
                        LIMIT 1
                    `, [cliente.id]);
                    
                    if (existe.rows.length > 0) {
                        continue; // Ya existe, no duplicar
                    }
                    
                    // Determinar prioridad según deuda
                    let prioridad = 'HIGH';
                    if (cliente.meses_deuda >= 10) {
                        prioridad = 'CRITICAL';
                    } else if (cliente.meses_deuda >= 6) {
                        prioridad = 'CRITICAL';
                    }
                    
                    const titulo = cliente.meses_deuda >= 5 
                        ? `🚨 CRÍTICO: Deuda de ${cliente.meses_deuda} meses`
                        : `⚠️ ALERTA: Deuda de ${cliente.meses_deuda} meses`;
                    
                    const accion = cliente.meses_deuda >= 8 
                        ? 'contacto-urgente-suspensión'
                        : 'contacto-deudor';
                    
                    // Crear notificación
                    await pool.query(`
                        INSERT INTO notificaciones_inteligentes 
                        (cliente_id, tipo, prioridad, titulo, mensaje, deuda_actual, 
                         patron_detectado, accion_sugerida, origen)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    `, [
                        cliente.id,
                        'DEUDA_CRITICA',
                        prioridad,
                        titulo,
                        `${cliente.nombre} ${cliente.apellido} debe ${cliente.meses_deuda} meses. Deuda total: S/ ${cliente.deuda_total}. REQUIERE ACCIÓN INMEDIATA.`,
                        cliente.deuda_total,
                        cliente.meses_deuda,
                        cliente.meses_deuda >= 8 ? 'CONTACTO URGENTE - CONSIDERAR SUSPENSIÓN' : 'Contactar para negociar plan',
                        'SISTEMA_AUTOMATICO'
                    ]);
                    
                    notificacionesCreadas++;
                    
                } catch (error) {
                    console.error(`   Error procesando cliente ${cliente.id}:`, error.message);
                }
            }
            
            console.log(`   ✅ ${notificacionesCreadas} alertas de deuda creadas`);
            return notificacionesCreadas;
            
        } catch (error) {
            console.error('   ❌ Error en alertarDeudaCritica:', error);
            return 0;
        }
    },

    /**
     * 2️⃣ DETECTAR PATRONES DE PAGO
     */
    async detectarPatronesPago() {
        try {
            let notificacionesCreadas = 0;
            
            const clientes = await pool.query(`
                SELECT 
                    c.id, c.nombre, c.apellido, c.patron_pago_dias,
                    COUNT(p.id) as total_pagos,
                    ROUND(AVG(EXTRACT(DAY FROM (p.fecha_pago - LAG(p.fecha_pago) OVER (ORDER BY p.fecha_pago))))) as promedio_dias
                FROM clientes c
                LEFT JOIN pagos p ON c.id = p.cliente_id
                WHERE c.estado = 'activo'
                GROUP BY c.id
                HAVING COUNT(p.id) >= 3  -- Mínimo 3 pagos para analizar patrón
            `);
            
            for (const cliente of clientes.rows) {
                try {
                    const esConfiable = cliente.promedio_dias && cliente.promedio_dias <= 40;
                    
                    // Verificar si ya existe para hoy
                    const existe = await pool.query(`
                        SELECT id FROM notificaciones_inteligentes
                        WHERE cliente_id = $1 
                        AND tipo = 'PATRON_PAGO_DETECTADO'
                        AND DATE(fecha_creacion) = CURRENT_DATE
                        LIMIT 1
                    `, [cliente.id]);
                    
                    if (existe.rows.length > 0) {
                        continue;
                    }
                    
                    const titulo = esConfiable 
                        ? `✅ Cliente CONFIABLE` 
                        : `⚠️ Patrón IRREGULAR`;
                    
                    const mensaje = esConfiable 
                        ? `${cliente.nombre} paga regularmente cada ${cliente.promedio_dias} días. Patrón CONFIABLE.`
                        : `${cliente.nombre} tiene pagos irregulares (promedio ${cliente.promedio_dias} días). REQUIERE SEGUIMIENTO.`;
                    
                    await pool.query(`
                        INSERT INTO notificaciones_inteligentes 
                        (cliente_id, tipo, prioridad, titulo, mensaje, 
                         patron_detectado, accion_sugerida, origen)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    `, [
                        cliente.id,
                        'PATRON_PAGO_DETECTADO',
                        esConfiable ? 'LOW' : 'MEDIUM',
                        titulo,
                        mensaje,
                        cliente.promedio_dias || 0,
                        esConfiable ? 'Mantener comunicación regular' : 'Seguimiento intensivo',
                        'SISTEMA_AUTOMATICO'
                    ]);
                    
                    notificacionesCreadas++;
                    
                } catch (error) {
                    console.error(`   Error procesando cliente ${cliente.id}:`, error.message);
                }
            }
            
            console.log(`   ✅ ${notificacionesCreadas} patrones detectados`);
            return notificacionesCreadas;
            
        } catch (error) {
            console.error('   ❌ Error en detectarPatronesPago:', error);
            return 0;
        }
    },

    /**
     * 3️⃣ ALERTAR PRÓXIMO VENCIMIENTO
     */
    async alertarProximoVencimiento() {
        try {
            let notificacionesCreadas = 0;
            
            const clientes = await pool.query(`
                SELECT 
                    id, nombre, apellido, fecha_proximo_vencimiento, 
                    precio_mensual, meses_deuda
                FROM clientes
                WHERE estado = 'activo'
                AND fecha_proximo_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
            `);
            
            for (const cliente of clientes.rows) {
                try {
                    const diasRestantes = Math.floor(
                        (new Date(cliente.fecha_proximo_vencimiento) - new Date()) / (1000 * 60 * 60 * 24)
                    );
                    
                    // Verificar si ya existe para hoy
                    const existe = await pool.query(`
                        SELECT id FROM notificaciones_inteligentes
                        WHERE cliente_id = $1 
                        AND tipo = 'PROXIMO_VENCIMIENTO'
                        AND DATE(fecha_creacion) = CURRENT_DATE
                        LIMIT 1
                    `, [cliente.id]);
                    
                    if (existe.rows.length > 0) {
                        continue;
                    }
                    
                    const prioridad = diasRestantes <= 1 ? 'HIGH' : 'MEDIUM';
                    const titulo = diasRestantes === 0 
                        ? `🚨 VENCE HOY`
                        : `📅 Vence en ${diasRestantes} día(s)`;
                    
                    await pool.query(`
                        INSERT INTO notificaciones_inteligentes 
                        (cliente_id, tipo, prioridad, titulo, mensaje, 
                         dias_sin_pagar, accion_sugerida, origen)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    `, [
                        cliente.id,
                        'PROXIMO_VENCIMIENTO',
                        prioridad,
                        titulo,
                        `${cliente.nombre} vence el ${new Date(cliente.fecha_proximo_vencimiento).toLocaleDateString()}. Monto: S/ ${cliente.precio_mensual}`,
                        diasRestantes,
                        'Recordar pago al cliente',
                        'SISTEMA_AUTOMATICO'
                    ]);
                    
                    notificacionesCreadas++;
                    
                } catch (error) {
                    console.error(`   Error procesando cliente ${cliente.id}:`, error.message);
                }
            }
            
            console.log(`   ✅ ${notificacionesCreadas} alertas de vencimiento creadas`);
            return notificacionesCreadas;
            
        } catch (error) {
            console.error('   ❌ Error en alertarProximoVencimiento:', error);
            return 0;
        }
    },

    /**
     * 4️⃣ ALERTAR CLIENTES NUEVOS SIN PAGO
     */
    async alertarClientesNuevosSinPago() {
        try {
            let notificacionesCreadas = 0;
            
            const clientes = await pool.query(`
                SELECT 
                    id, nombre, apellido, fecha_instalacion, precio_mensual
                FROM clientes
                WHERE estado = 'activo'
                AND estado_pago != 'pagado'
                AND fecha_instalacion >= CURRENT_DATE - INTERVAL '7 days'
                AND NOT EXISTS (SELECT 1 FROM pagos WHERE cliente_id = clientes.id)
            `);
            
            for (const cliente of clientes.rows) {
                try {
                    // Verificar si ya existe para hoy
                    const existe = await pool.query(`
                        SELECT id FROM notificaciones_inteligentes
                        WHERE cliente_id = $1 
                        AND tipo = 'CLIENTE_NUEVO_SIN_PAGO'
                        AND DATE(fecha_creacion) = CURRENT_DATE
                        LIMIT 1
                    `, [cliente.id]);
                    
                    if (existe.rows.length > 0) {
                        continue;
                    }
                    
                    await pool.query(`
                        INSERT INTO notificaciones_inteligentes 
                        (cliente_id, tipo, prioridad, titulo, mensaje, 
                         accion_sugerida, origen)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [
                        cliente.id,
                        'CLIENTE_NUEVO_SIN_PAGO',
                        'MEDIUM',
                        `🆕 Nuevo cliente sin pago`,
                        `${cliente.nombre} ${cliente.apellido} fue instalado el ${new Date(cliente.fecha_instalacion).toLocaleDateString()} pero aún no pagó. Monto: S/ ${cliente.precio_mensual}`,
                        'Contactar para primer pago',
                        'SISTEMA_AUTOMATICO'
                    ]);
                    
                    notificacionesCreadas++;
                    
                } catch (error) {
                    console.error(`   Error procesando cliente ${cliente.id}:`, error.message);
                }
            }
            
            console.log(`   ✅ ${notificacionesCreadas} alertas de clientes nuevos creadas`);
            return notificacionesCreadas;
            
        } catch (error) {
            console.error('   ❌ Error en alertarClientesNuevosSinPago:', error);
            return 0;
        }
    },

    /**
     * 5️⃣ NOTIFICAR CLIENTES QUE MEJORARON (Dejaron de deber)
     */
    async notificarClientesQueMejoraron() {
        try {
            let notificacionesCreadas = 0;
            
            const clientes = await pool.query(`
                SELECT 
                    c.id, c.nombre, c.apellido, c.estado_pago, 
                    c.fecha_ultimo_pago
                FROM clientes c
                WHERE c.estado = 'activo'
                AND c.estado_pago IN ('pagado', 'al_dia')
                AND c.fecha_ultimo_pago >= CURRENT_DATE - INTERVAL '7 days'
                AND NOT EXISTS (
                    SELECT 1 FROM notificaciones_inteligentes
                    WHERE cliente_id = c.id
                    AND tipo = 'CLIENTE_MEJORADO'
                    AND DATE(fecha_creacion) = CURRENT_DATE
                )
            `);
            
            for (const cliente of clientes.rows) {
                try {
                    const titulo = cliente.estado_pago === 'pagado' 
                        ? `✨ ¡AL DÍA!`
                        : `✅ Status MEJORADO`;
                    
                    const mensaje = cliente.estado_pago === 'pagado'
                        ? `${cliente.nombre} está completamente AL DÍA. Excelente cliente.`
                        : `${cliente.nombre} ha regulado su situación de pago.`;
                    
                    await pool.query(`
                        INSERT INTO notificaciones_inteligentes 
                        (cliente_id, tipo, prioridad, titulo, mensaje, accion_sugerida, origen)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [
                        cliente.id,
                        'CLIENTE_MEJORADO',
                        'LOW',
                        titulo,
                        mensaje,
                        'Mantener relación positiva',
                        'SISTEMA_AUTOMATICO'
                    ]);
                    
                    notificacionesCreadas++;
                    
                } catch (error) {
                    console.error(`   Error procesando cliente ${cliente.id}:`, error.message);
                }
            }
            
            console.log(`   ✅ ${notificacionesCreadas} clientes mejorados notificados`);
            return notificacionesCreadas;
            
        } catch (error) {
            console.error('   ❌ Error en notificarClientesQueMejoraron:', error);
            return 0;
        }
    },

    /**
     * LIMPIAR NOTIFICACIONES MUY ANTIGUAS
     */
    async limpiarNotificacionesAntiguas() {
        try {
            const result = await pool.query(`
                DELETE FROM notificaciones_inteligentes
                WHERE fecha_creacion < CURRENT_TIMESTAMP - INTERVAL '60 days'
                RETURNING id
            `);
            
            console.log(`🧹 ${result.rowCount} notificaciones antiguas eliminadas`);
            return result.rowCount;
            
        } catch (error) {
            console.error('❌ Error limpiando notificaciones:', error);
            return 0;
        }
    }
};

module.exports = notificacionInteligenteService;
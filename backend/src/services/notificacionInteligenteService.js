const pool = require('../config/database');

class NotificacionInteligenteService {
    /**
     * Generar notificaciones inteligentes para todos los clientes
     */
    async generarNotificaciones() {
        try {
            // Intentar usar la función de PostgreSQL si existe
            try {
                const result = await pool.query('SELECT generar_notificaciones_inteligentes() as cantidad');
                return {
                    success: true,
                    cantidad_generadas: result.rows[0].cantidad,
                    timestamp: new Date()
                };
            } catch (pgError) {
                // Si la función no existe, generar notificaciones manualmente
                console.log('Función PG no encontrada, generando notificaciones manualmente...');

                // Limpiar notificaciones antiguas
                await pool.query('DELETE FROM notificaciones_inteligentes WHERE fecha_creacion < NOW() - INTERVAL \'30 days\'');

                // Insertar nuevas notificaciones para clientes con deuda
                const insertQuery = `
                    INSERT INTO notificaciones_inteligentes
                    (cliente_id, tipo, prioridad, titulo, mensaje, accion_sugerida, deuda_actual, dias_sin_pagar, patron_detectado)
                    SELECT
                        c.id,
                        CASE
                            WHEN c.deuda_actual > 200 THEN 'CRITICO'
                            WHEN c.deuda_actual > 100 THEN 'ATENCION'
                            ELSE 'RECORDATORIO'
                        END as tipo,
                        CASE
                            WHEN c.deuda_actual > 200 THEN 'alta'
                            WHEN c.deuda_actual > 100 THEN 'media'
                            ELSE 'baja'
                        END as prioridad,
                        CASE
                            WHEN c.deuda_actual > 200 THEN 'Deuda Crítica - Acción Urgente'
                            WHEN c.deuda_actual > 100 THEN 'Atención Requerida'
                            ELSE 'Recordatorio de Pago'
                        END as titulo,
                        'Cliente con deuda pendiente de S/ ' || ROUND(c.deuda_actual::numeric, 2) as mensaje,
                        CASE
                            WHEN c.deuda_actual > 200 THEN 'visitar'
                            ELSE 'whatsapp'
                        END as accion_sugerida,
                        c.deuda_actual,
                        COALESCE(EXTRACT(DAY FROM (NOW() - (SELECT MAX(fecha_pago) FROM pagos WHERE cliente_id = c.id)))::integer, 30) as dias_sin_pagar,
                        30 as patron_detectado
                    FROM clientes c
                    WHERE c.deuda_actual > 0
                    ON CONFLICT (cliente_id) DO UPDATE SET
                        tipo = EXCLUDED.tipo,
                        prioridad = EXCLUDED.prioridad,
                        titulo = EXCLUDED.titulo,
                        mensaje = EXCLUDED.mensaje,
                        deuda_actual = EXCLUDED.deuda_actual,
                        dias_sin_pagar = EXCLUDED.dias_sin_pagar,
                        fecha_actualizacion = NOW()
                `;

                const result = await pool.query(insertQuery);

                return {
                    success: true,
                    cantidad_generadas: result.rowCount || 0,
                    timestamp: new Date(),
                    metodo: 'manual'
                };
            }
        } catch (error) {
            console.error('Error generando notificaciones:', error);
            throw error;
        }
    }

    /**
     * Obtener todas las notificaciones con filtros
     */
    async obtenerNotificaciones(filtros = {}) {
        try {
            const { tipo, prioridad, leida, archivada = false, limit = 50, offset = 0 } = filtros;

            let query = `
                SELECT * FROM v_notificaciones_completas
                WHERE archivada = $1
            `;
            const params = [archivada];
            let paramIndex = 2;

            // Filtro por tipo
            if (tipo) {
                query += ` AND tipo = $${paramIndex}`;
                params.push(tipo);
                paramIndex++;
            }

            // Filtro por prioridad
            if (prioridad) {
                query += ` AND prioridad = $${paramIndex}`;
                params.push(prioridad);
                paramIndex++;
            }

            // Filtro por leída
            if (leida !== undefined) {
                query += ` AND leida = $${paramIndex}`;
                params.push(leida);
                paramIndex++;
            }

            query += ` ORDER BY 
                CASE prioridad
                    WHEN 'alta' THEN 1
                    WHEN 'media' THEN 2
                    WHEN 'baja' THEN 3
                    ELSE 4
                END,
                fecha_creacion DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;
            params.push(limit, offset);

            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error obteniendo notificaciones:', error);
            throw error;
        }
    }

    /**
     * Obtener notificaciones de un cliente específico
     */
    async obtenerPorCliente(clienteId) {
        try {
            const query = `
                SELECT * FROM v_notificaciones_completas
                WHERE cliente_id = $1 AND archivada = false
                ORDER BY fecha_creacion DESC
            `;
            const result = await pool.query(query, [clienteId]);
            return result.rows;
        } catch (error) {
            console.error('Error obteniendo notificaciones del cliente:', error);
            throw error;
        }
    }

    /**
     * Obtener resumen de notificaciones (contadores)
     */
    async obtenerResumen() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE tipo = 'CRITICO') as criticas,
                    COUNT(*) FILTER (WHERE tipo = 'ATENCION') as atencion,
                    COUNT(*) FILTER (WHERE tipo = 'RECORDATORIO') as recordatorios,
                    COUNT(*) FILTER (WHERE tipo = 'AL_DIA') as al_dia,
                    COUNT(*) FILTER (WHERE leida = false) as no_leidas,
                    COUNT(*) FILTER (WHERE prioridad = 'alta') as prioridad_alta,
                    COUNT(*) FILTER (WHERE prioridad = 'media') as prioridad_media,
                    COUNT(*) FILTER (WHERE prioridad = 'baja') as prioridad_baja
                FROM notificaciones_inteligentes
                WHERE archivada = false
            `;
            const result = await pool.query(query);
            return result.rows[0];
        } catch (error) {
            console.error('Error obteniendo resumen:', error);
            throw error;
        }
    }

    /**
     * Marcar notificación como leída
     */
    async marcarComoLeida(notificacionId) {
        try {
            const query = `
                UPDATE notificaciones_inteligentes
                SET leida = true, fecha_lectura = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;
            const result = await pool.query(query, [notificacionId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error marcando como leída:', error);
            throw error;
        }
    }

    /**
     * Marcar múltiples notificaciones como leídas
     */
    async marcarVariasComoLeidas(notificacionIds) {
        try {
            const query = `
                UPDATE notificaciones_inteligentes
                SET leida = true, fecha_lectura = CURRENT_TIMESTAMP
                WHERE id = ANY($1)
                RETURNING id
            `;
            const result = await pool.query(query, [notificacionIds]);
            return {
                success: true,
                cantidad: result.rows.length
            };
        } catch (error) {
            console.error('Error marcando varias como leídas:', error);
            throw error;
        }
    }

    /**
     * Archivar notificación
     */
    async archivar(notificacionId) {
        try {
            const query = `
                UPDATE notificaciones_inteligentes
                SET archivada = true
                WHERE id = $1
                RETURNING *
            `;
            const result = await pool.query(query, [notificacionId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error archivando notificación:', error);
            throw error;
        }
    }

    /**
     * Calcular patrón de pago de un cliente
     */
    async calcularPatronCliente(clienteId) {
        try {
            const query = 'SELECT * FROM calcular_patron_pago($1)';
            const result = await pool.query(query, [clienteId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error calculando patrón:', error);
            throw error;
        }
    }

    /**
     * Actualizar modalidad de pago declarada de un cliente
     */
    async actualizarModalidadPago(clienteId, modalidad, notas = null) {
        try {
            const query = `
                UPDATE clientes
                SET modalidad_pago_declarada = $1,
                    notas_pago = COALESCE($2, notas_pago)
                WHERE id = $3
                RETURNING id, modalidad_pago_declarada, notas_pago, patron_pago_dias
            `;
            const result = await pool.query(query, [modalidad, notas, clienteId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error actualizando modalidad:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas generales
     */
    async obtenerEstadisticas() {
        try {
            const query = `
                SELECT 
                    -- Totales por tipo
                    COUNT(*) FILTER (WHERE tipo = 'CRITICO') as total_criticas,
                    COUNT(*) FILTER (WHERE tipo = 'ATENCION') as total_atencion,
                    COUNT(*) FILTER (WHERE tipo = 'RECORDATORIO') as total_recordatorios,
                    
                    -- Promedio de días sin pagar por tipo
                    AVG(dias_sin_pagar) FILTER (WHERE tipo = 'CRITICO') as promedio_dias_critico,
                    AVG(dias_sin_pagar) FILTER (WHERE tipo = 'ATENCION') as promedio_dias_atencion,
                    
                    -- Deuda total por tipo
                    SUM(deuda_actual) FILTER (WHERE tipo = 'CRITICO') as deuda_critica_total,
                    SUM(deuda_actual) FILTER (WHERE tipo = 'ATENCION') as deuda_atencion_total,
                    
                    -- Acciones sugeridas
                    COUNT(*) FILTER (WHERE accion_sugerida = 'visitar') as requieren_visita,
                    COUNT(*) FILTER (WHERE accion_sugerida = 'llamar') as requieren_llamada,
                    COUNT(*) FILTER (WHERE accion_sugerida = 'whatsapp') as requieren_whatsapp
                FROM notificaciones_inteligentes
                WHERE archivada = false
            `;
            const result = await pool.query(query);
            return result.rows[0];
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    /**
     * Obtener clientes con patrones irregulares
     */
    async obtenerClientesIrregulares() {
        try {
            const query = `
                SELECT 
                    c.id,
                    c.nombre,
                    c.apellido,
                    c.dni,
                    c.patron_pago_dias,
                    c.modalidad_pago_declarada,
                    p.*
                FROM clientes c
                CROSS JOIN LATERAL calcular_patron_pago(c.id) p
                WHERE p.confiabilidad < 50 -- Menos del 50% de confiabilidad
                AND c.estado = 'activo'
                ORDER BY p.confiabilidad ASC
                LIMIT 20
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error obteniendo clientes irregulares:', error);
            throw error;
        }
    }

    /**
     * Limpiar notificaciones antiguas (mantenimiento)
     */
    async limpiarNotificacionesAntiguas(diasArchivadas = 30) {
        try {
            const query = `
                DELETE FROM notificaciones_inteligentes
                WHERE archivada = true 
                AND fecha_creacion < CURRENT_DATE - INTERVAL '${diasArchivadas} days'
                RETURNING id
            `;
            const result = await pool.query(query);
            return {
                success: true,
                cantidad_eliminadas: result.rows.length
            };
        } catch (error) {
            console.error('Error limpiando notificaciones:', error);
            throw error;
        }
    }
}

module.exports = new NotificacionInteligenteService();
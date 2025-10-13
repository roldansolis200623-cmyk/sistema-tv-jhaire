// src/scripts/corregirDeudas.js
require('dotenv').config(); // ← IMPORTANTE: Esta línea al inicio

const pool = require('../config/database');

async function corregirTodasLasDeudas() {
    const client = await pool.connect();
    
    try {
        console.log('🔧 Iniciando corrección de deudas...\n');
        
        // Obtener todos los clientes activos
        const clientesQuery = 'SELECT id, nombre, apellido, fecha_instalacion FROM clientes WHERE estado = $1';
        const clientesResult = await client.query(clientesQuery, ['activo']);
        
        console.log(`📊 Total de clientes a procesar: ${clientesResult.rows.length}\n`);
        
        let clientesCorregidos = 0;
        let clientesAdelantados = 0;
        
        for (const cliente of clientesResult.rows) {
            const { id, nombre, apellido, fecha_instalacion } = cliente;
            
            if (!fecha_instalacion) {
                console.log(`⚠️  Cliente ${nombre} ${apellido} (ID: ${id}) - Sin fecha de instalación, saltando...`);
                continue;
            }
            
            // Calcular meses desde la instalación
            const hoy = new Date();
            const instalacion = new Date(fecha_instalacion);
            
            instalacion.setDate(1);
            instalacion.setHours(0, 0, 0, 0);
            hoy.setDate(1);
            hoy.setHours(0, 0, 0, 0);
            
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
                    console.log(`✅ ${nombre} ${apellido} (ID: ${id}) - ADELANTADO`);
                    console.log(`   Meses transcurridos: ${mesesDesdeInstalacion}`);
                    console.log(`   Meses pagados: ${totalMesesPagados}`);
                    console.log(`   Meses adelantados: ${Math.abs(deudaReal)}`);
                    clientesAdelantados++;
                } else {
                    console.log(`✅ ${nombre} ${apellido} (ID: ${id})`);
                    console.log(`   Meses transcurridos: ${mesesDesdeInstalacion}`);
                    console.log(`   Meses pagados: ${totalMesesPagados}`);
                    console.log(`   Deuda anterior: ${deudaActual} → Deuda real: ${deudaReal}`);
                }
                console.log('');
                
                clientesCorregidos++;
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log(`✅ Proceso completado`);
        console.log(`📊 Clientes procesados: ${clientesResult.rows.length}`);
        console.log(`🔧 Clientes corregidos: ${clientesCorregidos}`);
        console.log(`🚀 Clientes adelantados: ${clientesAdelantados}`);
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Error durante la corrección:', error);
    } finally {
        client.release();
        process.exit(0);
    }
}

// Ejecutar
corregirTodasLasDeudas();
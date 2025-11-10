const pool = require('../config/database');

const PagoModel = {
    /**
     * Crear tabla de pagos si no existe
     */
    async crearTabla() {
        const query = `
            CREATE TABLE IF NOT EXISTS pagos (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
                monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
                fecha_pago DATE NOT NULL DEFAULT CURRENT_DATE,
                metodo_pago VARCHAR(50) NOT NULL,
                numero_recibo VARCHAR(100),
                telefono_contacto VARCHAR(20),
                numero_operacion VARCHAR(100),
                observaciones TEXT,
                meses_pagados INTEGER DEFAULT 1 CHECK (meses_pagados > 0),
                meses_detalle TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_pagos_cliente ON pagos(cliente_id);
            CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);
            CREATE INDEX IF NOT EXISTS idx_pagos_metodo ON pagos(metodo_pago);
            
            -- Trigger para actualizar updated_at
            CREATE OR REPLACE FUNCTION update_pagos_timestamp()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trigger_update_pagos_timestamp ON pagos;
            CREATE TRIGGER trigger_update_pagos_timestamp
                BEFORE UPDATE ON pagos
                FOR EACH ROW
                EXECUTE FUNCTION update_pagos_timestamp();
        `;
        
        try {
            await pool.query(query);
            console.log('✅ Tabla pagos creada/verificada con constraints mejorados');
        } catch (error) {
            console.error('❌ Error creando tabla pagos:', error);
            throw error;
        }
    },

    /**
     * ✅✅✅ CORREGIDO - Registrar pago con cálculo EXACTO de meses
     */
    async crear(pago) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            console.log(`💰 Registrando pago: Cliente ${pago.cliente_id}, Monto S/ ${pago.monto}, Meses: ${pago.meses_pagados}`);

            // Obtener datos del cliente
            const clienteQuery = 'SELECT meses_deuda, precio_mensual, fecha_instalacion, nombre, apellido FROM clientes WHERE id = $1';
            const clienteResult = await client.query(clienteQuery, [pago.cliente_id]);
            
            if (clienteResult.rows.length === 0) {
                throw new Error('Cliente no encontrado');
            }
            
            const cliente = clienteResult.rows[0];
            const { meses_deuda, fecha_instalacion, nombre, apellido } = cliente;
            const mesesPagados = parseInt(pago.meses_pagados) || 1;

            console.log(`   Cliente: ${nombre} ${apellido}, Deuda actual: ${meses_deuda} mes(es)`);

            // ✅ CALCULAR LOS MESES ESPECÍFICOS - AHORA CORRECTO
            const mesesDetalle = this.generarMesesEspecificosAlPagar(
                meses_deuda, 
                mesesPagados, 
                new Date(pago.fecha_pago || new Date().toISOString().split('T')[0])
            );
            console.log(`   📅 Meses pagando: ${mesesDetalle}`);

            // Insertar el pago
            const insertQuery = `
                INSERT INTO pagos (
                    cliente_id, monto, fecha_pago, metodo_pago, 
                    numero_recibo, telefono_contacto, numero_operacion, 
                    observaciones, meses_pagados, meses_detalle
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `;
            
            const values = [
                pago.cliente_id,
                parseFloat(pago.monto),
                pago.fecha_pago || new Date().toISOString().split('T')[0],
                pago.metodo_pago,
                pago.numero_recibo || null,
                pago.telefono_contacto || null,
                pago.numero_operacion || null,
                pago.observaciones || null,
                mesesPagados,
                mesesDetalle
            ];
            
            const result = await client.query(insertQuery, values);
            const pagoInsertado = result.rows[0];

            console.log(`   ✅ Pago registrado con ID: ${pagoInsertado.id}`);

            // ✅ CALCULAR DEUDA DENTRO DE LA MISMA TRANSACCIÓN
            if (!fecha_instalacion) {
                throw new Error(`Cliente ${nombre} ${apellido} no tiene fecha de instalación`);
            }

            const hoy = new Date();
            const instalacion = new Date(fecha_instalacion);
            const mesesDesdeInstalacion = this.calcularMesesEntre(instalacion, hoy);
            
            // Obtener total de meses pagados (incluye el pago recién insertado)
            const pagosQuery = 'SELECT COALESCE(SUM(meses_pagados), 0) as total_pagado FROM pagos WHERE cliente_id = $1';
            const pagosResult = await client.query(pagosQuery, [pago.cliente_id]);
            const totalMesesPagados = parseInt(pagosResult.rows[0].total_pagado) || 0;
            
            // Calcular deuda real
            const deudaReal = mesesDesdeInstalacion - totalMesesPagados;
            
            console.log(`   📊 Meses desde instalación: ${mesesDesdeInstalacion}`);
            console.log(`   📊 Total meses pagados: ${totalMesesPagados}`);
            console.log(`   📊 Deuda real: ${deudaReal}`);
            
            // Determinar estado de pago
            let estadoPago = 'deudor';
            if (deudaReal < 0) {
                estadoPago = 'adelantado';
            } else if (deudaReal === 0) {
                estadoPago = 'pagado';
            } else if (deudaReal <= 1) {
                estadoPago = 'al_dia';
            }

            console.log(`   📊 Nuevo estado: ${estadoPago}`);
            
            // Actualizar la deuda del cliente
            const updateQuery = `
                UPDATE clientes SET
                    meses_deuda = $1,
                    estado_pago = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $3
            `;
            await client.query(updateQuery, [deudaReal, estadoPago, pago.cliente_id]);

            await client.query('COMMIT');
            
            if (deudaReal < 0) {
                console.log(`✅ ¡PAGO EXITOSO! Cliente ${nombre} ${apellido} tiene ${Math.abs(deudaReal)} mes(es) ADELANTADOS 🎉`);
            } else if (deudaReal === 0) {
                console.log(`✅ ¡PAGO EXITOSO! Cliente ${nombre} ${apellido} está AL DÍA ✨`);
            } else {
                console.log(`✅ ¡PAGO EXITOSO! Cliente ${nombre} ${apellido} ahora debe ${deudaReal} mes(es)`);
            }
            
            return pagoInsertado;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error creando pago:', error.message);
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * ✅✅✅ NUEVA FUNCIÓN - CALCULA LOS MESES ESPECÍFICOS CORRECTAMENTE
     * 
     * LÓGICA:
     * - Si cliente DEBE X meses: Paga retroactivamente desde el mes más reciente
     *   Ejemplo: Hoy Nov, debe 3 meses (ago, sep, oct) → Paga oct, sep, ago (del más reciente)
     * - Si cliente NO DEBE: Paga meses adelantados desde hoy
     */
    generarMesesEspecificosAlPagar(mesesDeuda, mesesPagados, fechaPago) {
        const mesesNombres = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const mesesPagando = [];
        const mesActual = fechaPago.getMonth(); // 0-11
        const añoActual = fechaPago.getFullYear();
        
        console.log(`📅 CALCULANDO MESES ESPECÍFICOS:`);
        console.log(`   → Deuda: ${mesesDeuda} mes(es), Pagando: ${mesesPagados} meses`);
        console.log(`   → Fecha de pago: ${mesesNombres[mesActual]} ${añoActual}`);
        
        // ============================================
        // CASO 1: Cliente DEBE dinero (meses_deuda > 0)
        // ============================================
        if (mesesDeuda > 0) {
            console.log(`   → CASO: Cliente debe, paga retroactivamente desde más reciente`);
            
            // Empezar desde hace "mesesDeuda" meses y retroceder
            // Ejemplo: Hoy=Nov(10), debe=3 meses
            // Entonces: (10-1)=9=Oct, (10-2)=8=Sep, (10-3)=7=Aug
            
            for (let i = 0; i < mesesPagados && i < mesesDeuda; i++) {
                let mesRetroceso = (mesActual - 1) - i;
                let año = añoActual;
                
                // Ajustar si mes es negativo (mes del año anterior)
                while (mesRetroceso < 0) {
                    mesRetroceso += 12;
                    año -= 1;
                }
                
                const nombreMes = mesesNombres[mesRetroceso];
                mesesPagando.unshift(`${nombreMes} ${año}`);
                console.log(`   → ${i + 1}: ${nombreMes} ${año}`);
            }
            
            // Si paga más meses de los que debe, son adelantos
            if (mesesPagados > mesesDeuda) {
                const mesesAdelantados = mesesPagados - mesesDeuda;
                console.log(`   → ADELANTOS: ${mesesAdelantados} mes(es) adicionales`);
                
                for (let i = 0; i < mesesAdelantados; i++) {
                    let mesAdelanto = (mesActual + i) % 12;
                    let año = añoActual;
                    if (mesActual + i >= 12) año += 1;
                    
                    const nombreMes = mesesNombres[mesAdelanto];
                    mesesPagando.push(`${nombreMes} ${año} (ADELANTADO)`);
                    console.log(`   → Adelanto ${i + 1}: ${nombreMes} ${año}`);
                }
            }
        } 
        // ============================================
        // CASO 2: Cliente NO debe (meses_deuda <= 0)
        // ============================================
        else {
            console.log(`   → CASO: Cliente sin deuda, paga adelantado`);
            
            for (let i = 0; i < mesesPagados; i++) {
                let mesAdelanto = (mesActual + i) % 12;
                let año = añoActual;
                if (mesActual + i >= 12) año += 1;
                
                const nombreMes = mesesNombres[mesAdelanto];
                mesesPagando.push(`${nombreMes} ${año}`);
                console.log(`   → Adelanto ${i + 1}: ${nombreMes} ${año}`);
            }
        }
        
        const resultado = mesesPagando.join(', ');
        console.log(`   ✅ RESULTADO FINAL: ${resultado}`);
        
        return resultado;
    },

    /**
     * ✅ MEJORADO - Función antigua para compatibilidad
     * (Mantener para no romper código existente)
     */
    calcularMesesDetalle(mesesDeuda, mesesPagados) {
        return this.generarMesesEspecificosAlPagar(mesesDeuda, mesesPagados, new Date());
    },

    /**
     * Obtener todos los pagos
     */
    async getAll() {
        const query = `
            SELECT 
                p.*,
                c.nombre as cliente_nombre,
                c.apellido as cliente_apellido,
                c.dni as cliente_dni
            FROM pagos p
            INNER JOIN clientes c ON p.cliente_id = c.id
            ORDER BY p.fecha_pago DESC, p.id DESC
        `;

        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error obteniendo pagos:', error);
            throw error;
        }
    },

    /**
     * Obtener pagos de un cliente
     */
    async getPorCliente(clienteId) {
        const query = `
            SELECT * FROM pagos 
            WHERE cliente_id = $1 
            ORDER BY fecha_pago DESC
        `;

        try {
            const result = await pool.query(query, [clienteId]);
            return result.rows;
        } catch (error) {
            console.error('Error obteniendo pagos por cliente:', error);
            throw error;
        }
    },

    /**
     * Obtener un pago por ID
     */
    async getById(id) {
        const query = 'SELECT * FROM pagos WHERE id = $1';

        try {
            const result = await pool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error obteniendo pago por ID:', error);
            throw error;
        }
    },

    /**
     * Actualizar un pago
     */
    async actualizar(id, datosPago) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const actualizarQuery = `
                UPDATE pagos SET
                    monto = COALESCE($2, monto),
                    fecha_pago = COALESCE($3, fecha_pago),
                    metodo_pago = COALESCE($4, metodo_pago),
                    numero_recibo = COALESCE($5, numero_recibo),
                    observaciones = COALESCE($6, observaciones),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;

            const result = await client.query(actualizarQuery, [
                id,
                datosPago.monto,
                datosPago.fecha_pago,
                datosPago.metodo_pago,
                datosPago.numero_recibo,
                datosPago.observaciones
            ]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error actualizando pago:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Eliminar un pago y recalcular deuda
     */
    async eliminar(id) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Obtener datos del pago
            const pagoQuery = 'SELECT cliente_id, monto, meses_pagados FROM pagos WHERE id = $1';
            const pagoResult = await client.query(pagoQuery, [id]);
            
            if (pagoResult.rows.length === 0) {
                throw new Error('Pago no encontrado');
            }
            
            const { cliente_id, monto, meses_pagados } = pagoResult.rows[0];
            
            console.log(`🗑️  Eliminando pago ID ${id}: Cliente ${cliente_id}, S/ ${monto}, ${meses_pagados} mes(es)`);
            
            // Obtener fecha de instalación y datos del cliente
            const clienteQuery = 'SELECT fecha_instalacion, nombre, apellido FROM clientes WHERE id = $1';
            const clienteResult = await client.query(clienteQuery, [cliente_id]);
            
            if (clienteResult.rows.length === 0) {
                throw new Error('Cliente no encontrado');
            }
            
            const { fecha_instalacion, nombre, apellido } = clienteResult.rows[0];
            
            // Eliminar el pago
            await client.query('DELETE FROM pagos WHERE id = $1', [id]);
            console.log(`   ✅ Pago eliminado`);
            
            // ✅ RECALCULAR DEUDA DESPUÉS DE ELIMINAR
            const hoy = new Date();
            const instalacion = new Date(fecha_instalacion);
            const mesesDesdeInstalacion = this.calcularMesesEntre(instalacion, hoy);
            
            // Obtener total de meses pagados DESPUÉS de eliminar
            const pagosQuery = 'SELECT COALESCE(SUM(meses_pagados), 0) as total_pagado FROM pagos WHERE cliente_id = $1';
            const pagosResult = await client.query(pagosQuery, [cliente_id]);
            const totalMesesPagados = parseInt(pagosResult.rows[0].total_pagado) || 0;
            
            const deudaReal = mesesDesdeInstalacion - totalMesesPagados;
            
            // Determinar estado
            let estadoPago = 'deudor';
            if (deudaReal < 0) {
                estadoPago = 'adelantado';
            } else if (deudaReal === 0) {
                estadoPago = 'pagado';
            } else if (deudaReal <= 1) {
                estadoPago = 'al_dia';
            }
            
            // Actualizar cliente
            const updateQuery = `
                UPDATE clientes 
                SET meses_deuda = $1,
                    estado_pago = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $3
            `;
            await client.query(updateQuery, [deudaReal, estadoPago, cliente_id]);
            
            await client.query('COMMIT');
            
            console.log(`✅ Pago eliminado exitosamente. Cliente ${nombre} ${apellido} ahora ${
                deudaReal < 0 ? `tiene ${Math.abs(deudaReal)} mes(es) adelantados` : 
                deudaReal === 0 ? 'está al día' :
                `debe ${deudaReal} mes(es)`
            }`);
            
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error eliminando pago:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Calcular deuda real del cliente
     */
    async calcularDeudaReal(clienteId) {
        const client = await pool.connect();
        try {
            const clienteQuery = 'SELECT fecha_instalacion FROM clientes WHERE id = $1';
            const clienteResult = await client.query(clienteQuery, [clienteId]);
            
            if (clienteResult.rows.length === 0) {
                throw new Error('Cliente no encontrado');
            }
            
            const { fecha_instalacion } = clienteResult.rows[0];
            
            if (!fecha_instalacion) {
                return 1;
            }
            
            const hoy = new Date();
            const instalacion = new Date(fecha_instalacion);
            const mesesDesdeInstalacion = this.calcularMesesEntre(instalacion, hoy);
            
            const pagosQuery = 'SELECT COALESCE(SUM(meses_pagados), 0) as total_pagado FROM pagos WHERE cliente_id = $1';
            const pagosResult = await client.query(pagosQuery, [clienteId]);
            const totalMesesPagados = parseInt(pagosResult.rows[0].total_pagado) || 0;
            
            const deudaReal = mesesDesdeInstalacion - totalMesesPagados;
            
            return deudaReal;
            
        } finally {
            client.release();
        }
    },

    /**
     * ✅ MEJORADO - Actualizar estado de todos los clientes
     */
    async actualizarTodosLosEstados() {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const clientesQuery = "SELECT id, nombre, apellido FROM clientes WHERE estado = 'activo'";
            const clientesResult = await client.query(clientesQuery);
            
            console.log(`🔄 Actualizando estado de ${clientesResult.rows.length} clientes...`);
            
            let actualizados = 0;
            for (const cliente of clientesResult.rows) {
                try {
                    const deudaReal = await this.calcularDeudaReal(cliente.id);
                    
                    let estadoPago = 'deudor';
                    if (deudaReal < 0) {
                        estadoPago = 'adelantado';
                    } else if (deudaReal === 0) {
                        estadoPago = 'pagado';
                    } else if (deudaReal <= 1) {
                        estadoPago = 'al_dia';
                    }
                    
                    const updateQuery = `
                        UPDATE clientes 
                        SET meses_deuda = $1,
                            estado_pago = $2,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = $3
                    `;
                    await client.query(updateQuery, [deudaReal, estadoPago, cliente.id]);
                    
                    actualizados++;
                    
                    if (actualizados % 50 === 0) {
                        console.log(`   ${actualizados}/${clientesResult.rows.length} clientes actualizados...`);
                    }
                } catch (error) {
                    console.error(`   ⚠️  Error actualizando cliente ${cliente.id} (${cliente.nombre} ${cliente.apellido}):`, error.message);
                }
            }
            
            await client.query('COMMIT');
            console.log(`✅ ${actualizados} estados actualizados correctamente`);
            
            return actualizados;
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error actualizando estados:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    // ✅ CORREGIDA - Calcular meses entre dos fechas (SIN +1 extra)
calcularMesesEntre(fecha1, fecha2) {
    const d1 = new Date(fecha1);
    const d2 = new Date(fecha2);
    
    // Normalizar a inicio de mes
    d1.setDate(1);
    d1.setHours(0, 0, 0, 0);
    d2.setDate(1);
    d2.setHours(0, 0, 0, 0);
    
    // Calcular diferencia en meses
    const años = d2.getFullYear() - d1.getFullYear();
    const meses = d2.getMonth() - d1.getMonth();
    const totalMeses = (años * 12) + meses;
    
    // ✅ SOLO sumar +1 si es el mismo mes
    return Math.max(1, totalMeses + 1);
}
};

module.exports = PagoModel;
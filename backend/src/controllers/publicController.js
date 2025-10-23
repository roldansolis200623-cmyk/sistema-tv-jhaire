const pool = require('../config/database');

// 🔍 Consultar deuda por DNI (sin autenticación)
exports.consultarDeuda = async (req, res) => {
    try {
        const { dni } = req.body;
        
        if (!dni) {
            return res.status(400).json({ 
                success: false,
                error: 'DNI o número de teléfono requerido' 
            });
        }

        // Log de consulta (auditoría)
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent') || 'Unknown';

        // Buscar cliente por DNI o teléfono
        const query = `
            SELECT 
                id,
                nombre,
                apellido,
                direccion,
                telefono,
                precio_mensual,
                meses_deuda,
                fecha_instalacion,
                estado
            FROM clientes 
            WHERE (dni = $1 OR telefono = $1) 
            AND estado IN ('activo', 'suspendido')
        `;
        
        const result = await pool.query(query, [dni.trim()]);
        
        if (result.rows.length === 0) {
            // Log de consulta fallida
            await pool.query(
                'INSERT INTO logs_consultas (dni, ip_address, user_agent, resultado) VALUES ($1, $2, $3, $4)',
                [dni, ipAddress, userAgent, 'no_encontrado']
            );
            
            return res.status(404).json({
                success: false,
                error: 'Cliente no encontrado'
            });
        }

        const cliente = result.rows[0];
        const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`;
        const deudaTotal = cliente.meses_deuda * cliente.precio_mensual;

        // Obtener último pago
        const ultimoPagoQuery = `
            SELECT fecha_pago 
            FROM pagos 
            WHERE cliente_id = $1 
            ORDER BY fecha_pago DESC 
            LIMIT 1
        `;
        const ultimoPagoResult = await pool.query(ultimoPagoQuery, [cliente.id]);
        const ultimoPago = ultimoPagoResult.rows[0]?.fecha_pago || null;

        // Log de consulta exitosa
        await pool.query(
            'INSERT INTO logs_consultas (dni, ip_address, user_agent, resultado) VALUES ($1, $2, $3, $4)',
            [dni, ipAddress, userAgent, 'encontrado']
        );

        res.json({
            success: true,
            data: {
                nombre: nombreCompleto,
                direccion: cliente.direccion,
                telefono: cliente.telefono,
                meses_deuda: cliente.meses_deuda,
                precio_mensual: parseFloat(cliente.precio_mensual),
                deuda_total: parseFloat(deudaTotal.toFixed(2)),
                ultimo_pago: ultimoPago,
                estado: cliente.estado
            }
        });

    } catch (error) {
        console.error('Error en consultarDeuda:', error);
        res.status(500).json({
            success: false,
            error: 'Error al consultar deuda'
        });
    }
};

// 📱 Obtener métodos de pago configurados
exports.obtenerMetodosPago = async (req, res) => {
    try {
        const metodos = {
            yape: ['991-569-419', '995-151-453'],
            bancos: [
                { banco: 'BCP', cuenta: '570-04329682069', titular: 'Francisca Capa Montero' },
                { banco: 'BCP', cuenta: '570-71655133-0-75', titular: 'Damian Rosendo Campos Ugarte' },
                { banco: 'Interbank', cuenta: '772-300-6808874', titular: 'Telecomunicaciones Jhair EIRL' },
                { banco: 'Caja Trujillo', cuenta: '792-321005070', titular: 'Damian Rosendo Campos Ugarte' },
                { banco: 'Banco de la Nación', cuenta: '048-01086832', titular: 'Damian Rosendo Campos Ugarte' }
            ]
        };

        res.json({
            success: true,
            data: metodos
        });

    } catch (error) {
        console.error('Error en obtenerMetodosPago:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener métodos de pago'
        });
    }
};

// 📊 Estadísticas de consultas (solo para admin)
exports.obtenerEstadisticasConsultas = async (req, res) => {
    try {
        // Consultas de hoy
        const hoyQuery = `
            SELECT COUNT(*) as total 
            FROM logs_consultas 
            WHERE DATE(timestamp) = CURRENT_DATE
        `;
        const hoyResult = await pool.query(hoyQuery);

        // Consultas de esta semana
        const semanaQuery = `
            SELECT COUNT(*) as total 
            FROM logs_consultas 
            WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
        `;
        const semanaResult = await pool.query(semanaQuery);

        // Consultas del mes
        const mesQuery = `
            SELECT COUNT(*) as total 
            FROM logs_consultas 
            WHERE DATE_TRUNC('month', timestamp) = DATE_TRUNC('month', CURRENT_DATE)
        `;
        const mesResult = await pool.query(mesQuery);

        // DNIs más consultados
        const popularesQuery = `
            SELECT dni, COUNT(*) as consultas 
            FROM logs_consultas 
            WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY dni 
            ORDER BY consultas DESC 
            LIMIT 10
        `;
        const popularesResult = await pool.query(popularesQuery);

        res.json({
            success: true,
            data: {
                hoy: parseInt(hoyResult.rows[0].total),
                semana: parseInt(semanaResult.rows[0].total),
                mes: parseInt(mesResult.rows[0].total),
                populares_dni: popularesResult.rows
            }
        });

    } catch (error) {
        console.error('Error en obtenerEstadisticasConsultas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas'
        });
    }
};
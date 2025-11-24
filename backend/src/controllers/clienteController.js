const ClienteModel = require('../models/clienteModel');
const pool = require('../config/database');
const notificacionInteligenteService = require('../services/notificacionInteligenteService');

const clienteController = {
    // Obtener todos los clientes
    getAll: async (req, res) => {
        try {
            const clientes = await ClienteModel.getAll();
            res.json(clientes);
        } catch (error) {
            console.error('Error obteniendo clientes:', error);
            res.status(500).json({ error: 'Error obteniendo clientes' });
        }
    },

    // Obtener cliente por ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const cliente = await ClienteModel.getById(id);

            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }

            res.json(cliente);
        } catch (error) {
            console.error('Error obteniendo cliente:', error);
            res.status(500).json({ error: 'Error obteniendo cliente' });
        }
    },

    // ✅ Crear nuevo cliente y generar notificaciones inteligentes
    create: async (req, res) => {
        try {
            console.log('📝 Creando cliente...', req.body);

            const nuevoCliente = await ClienteModel.create(req.body);

            console.log('✅ Cliente creado exitosamente:', nuevoCliente.id);

            // 🔔 Generar notificaciones inteligentes INMEDIATAMENTE
            try {
                console.log('🤖 Iniciando generación de notificaciones inteligentes...');
                const totalCreadas = await notificacionInteligenteService.generarNotificacionesInteligentes();
                console.log(`✅ ${totalCreadas} notificaciones inteligentes generadas`);
            } catch (notifError) {
                console.error('⚠️ Error generando notificaciones inteligentes:', notifError);
                console.error('Stack completo:', notifError.stack);
                // No fallar la creación del cliente si fallan las notificaciones
            }

            res.status(201).json({
                message: 'Cliente creado exitosamente',
                cliente: nuevoCliente
            });
        } catch (error) {
            console.error('❌ Error creando cliente:', error);
            console.error('Stack:', error.stack);
            res.status(500).json({
                error: 'Error creando cliente',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Actualizar cliente
    update: async (req, res) => {
        try {
            const { id } = req.params;
            
            console.log('🔵 1. Iniciando actualización del cliente:', id);
            
            // 1. Obtener datos actuales del cliente ANTES de actualizar
            const clienteActual = await ClienteModel.getById(id);
            
            if (!clienteActual) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }
            
            console.log('🔵 2. Cliente actual:', {
                tipo_servicio: clienteActual.tipo_servicio,
                plan: clienteActual.plan,
                tipo_senal: clienteActual.tipo_senal,
                perfil_internet_id: clienteActual.perfil_internet_id,
                precio_mensual: clienteActual.precio_mensual
            });
            
            console.log('🔵 3. Datos nuevos recibidos:', {
                tipo_servicio: req.body.tipo_servicio,
                plan: req.body.plan,
                tipo_senal: req.body.tipo_senal,
                perfil_internet_id: req.body.perfil_internet_id,
                precio_mensual: req.body.precio_mensual
            });
            
            // 2. Obtener nombres de perfiles si existen
            let perfilAnteriorNombre = null;
            let perfilNuevoNombre = null;
            
            if (clienteActual.perfil_internet_id) {
                const perfilAnterior = await pool.query(
                    'SELECT nombre FROM perfiles_internet WHERE id = $1',
                    [clienteActual.perfil_internet_id]
                );
                perfilAnteriorNombre = perfilAnterior.rows[0]?.nombre;
                console.log('🔵 4a. Perfil anterior:', perfilAnteriorNombre);
            }
            
            if (req.body.perfil_internet_id) {
                const perfilNuevo = await pool.query(
                    'SELECT nombre FROM perfiles_internet WHERE id = $1',
                    [req.body.perfil_internet_id]
                );
                perfilNuevoNombre = perfilNuevo.rows[0]?.nombre;
                console.log('🔵 4b. Perfil nuevo:', perfilNuevoNombre);
            }
            
            // 3. Actualizar el cliente
            const clienteActualizado = await ClienteModel.update(id, req.body);
            console.log('🔵 5. Cliente actualizado exitosamente');
            
            // 4. Detectar cambios importantes
            const cambioServicio = clienteActual.tipo_servicio !== clienteActualizado.tipo_servicio;
            const cambioPlan = clienteActual.plan !== clienteActualizado.plan;
            const cambioSenal = clienteActual.tipo_senal !== clienteActualizado.tipo_senal;
            const cambioPerfil = clienteActual.perfil_internet_id !== clienteActualizado.perfil_internet_id;
            const cambioPrecio = parseFloat(clienteActual.precio_mensual) !== parseFloat(clienteActualizado.precio_mensual);
            
            console.log('🔵 6. Cambios detectados:', {
                cambioServicio,
                cambioPlan,
                cambioSenal,
                cambioPerfil,
                cambioPrecio
            });
            
            const huboCambios = cambioServicio || cambioPlan || cambioSenal || cambioPerfil || cambioPrecio;
            
            console.log('🔵 7. ¿Hubo cambios?', huboCambios);
            
            // 5. Registrar migraciones si hubo cambios
            if (huboCambios) {
                console.log('🔵 8. Registrando migraciones...');
                
                const resultadoMigracion = await ClienteModel.registrarMigracion(
                    id,
                    {
                        ...clienteActual,
                        perfil_internet_nombre: perfilAnteriorNombre
                    },
                    {
                        ...clienteActualizado,
                        perfil_internet_nombre: perfilNuevoNombre
                    },
                    req.usuario?.nombre || 'Administrador',
                    req.body.motivo_cambio || null
                );
                
                console.log('🔵 9. Migraciones registradas:', resultadoMigracion.length, 'registros');
                console.log('🔵 10. Detalles:', resultadoMigracion);
            } else {
                console.log('🔵 8. No se detectaron cambios, no se registra migración');
            }

            res.json({
                message: 'Cliente actualizado exitosamente',
                cliente: clienteActualizado,
                migracion: huboCambios
            });
        } catch (error) {
            console.error('❌ ERROR actualizando cliente:', error);
            console.error('❌ Stack:', error.stack);
            res.status(500).json({ error: 'Error actualizando cliente' });
        }
    },

    // Eliminar cliente
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const clienteEliminado = await ClienteModel.delete(id);

            if (!clienteEliminado) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }

            res.json({
                message: 'Cliente eliminado exitosamente',
                cliente: clienteEliminado
            });
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            res.status(500).json({ error: 'Error eliminando cliente' });
        }
    },

    // ✅ MEJORADO: SUSPENDER CLIENTE - Ahora con más validaciones
    suspender: async (req, res) => {
        try {
            const { id } = req.params;
            const { motivo, observaciones, suspendido_por } = req.body;

            // Validaciones adicionales
            if (!motivo || motivo.trim() === '') {
                return res.status(400).json({ error: 'El motivo es obligatorio' });
            }

            const cliente = await ClienteModel.getById(id);
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }

            // Verificar que no esté ya suspendido
            if (cliente.estado === 'suspendido') {
                return res.status(400).json({ error: 'Cliente ya está suspendido' });
            }

            console.log(`⏸️ Suspendiendo cliente: ${cliente.nombre} ${cliente.apellido}`);

            const clienteSuspendido = await ClienteModel.suspender(id, {
                motivo,
                observaciones,
                suspendido_por: suspendido_por || 'Administrador'
            });

            await ClienteModel.registrarSuspension(id, {
                motivo,
                observaciones,
                suspendido_por: suspendido_por || 'Administrador'
            });

            // ✅ AGREGAR: Crear notificación inteligente
            try {
                await pool.query(`
                    INSERT INTO notificaciones_inteligentes (
                        cliente_id, tipo, prioridad, titulo, mensaje, 
                        accion_sugerida, origen
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [
                    id,
                    'CLIENTE_SUSPENDIDO',
                    'HIGH',
                    `Cliente Suspendido: ${cliente.nombre}`,
                    `${cliente.nombre} ${cliente.apellido} ha sido suspendido. Motivo: ${motivo}`,
                    'Reactivar cliente',
                    'MANUAL'
                ]);
                console.log(`✅ Notificación de suspensión creada`);
            } catch (notifError) {
                console.error('⚠️ Error creando notificación:', notifError);
            }

            res.json({
                message: 'Cliente suspendido exitosamente',
                cliente: clienteSuspendido,
                success: true
            });
        } catch (error) {
            console.error('Error suspendiendo cliente:', error);
            res.status(500).json({ error: 'Error suspendiendo cliente' });
        }
    },

    // ✅ CORREGIDO: REACTIVAR CLIENTE - Eliminar llamada a registrarReactivacion que no existe
    reactivar: async (req, res) => {
        try {
            const { id } = req.params;
            const { reactivado_por } = req.body;

            const cliente = await ClienteModel.getById(id);
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }

            // Verificar que esté suspendido
            if (cliente.estado !== 'suspendido') {
                return res.status(400).json({ 
                    error: `Cliente no está suspendido. Estado actual: ${cliente.estado}` 
                });
            }

            console.log(`▶️ Reactivando cliente: ${cliente.nombre} ${cliente.apellido}`);

            // ✅ SOLO REACTIVAR - Sin llamar a registrarReactivacion
            const clienteReactivado = await ClienteModel.reactivar(id);

            // ✅ AGREGAR: Crear notificación inteligente
            try {
                await pool.query(`
                    INSERT INTO notificaciones_inteligentes (
                        cliente_id, tipo, prioridad, titulo, mensaje, 
                        accion_sugerida, origen
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [
                    id,
                    'CLIENTE_REACTIVADO',
                    'MEDIUM',
                    `Cliente Reactivado: ${cliente.nombre}`,
                    `${cliente.nombre} ${cliente.apellido} ha sido reactivado correctamente`,
                    'Monitorear pagos',
                    'MANUAL'
                ]);
                console.log(`✅ Notificación de reactivación creada`);
            } catch (notifError) {
                console.error('⚠️ Error creando notificación:', notifError);
            }

            res.json({
                message: 'Cliente reactivado exitosamente',
                cliente: clienteReactivado,
                success: true
            });
        } catch (error) {
            console.error('Error reactivando cliente:', error);
            res.status(500).json({ error: 'Error reactivando cliente' });
        }
    },

    // OBTENER HISTORIAL DE SUSPENSIONES
    getHistorialSuspensiones: async (req, res) => {
        try {
            const { id } = req.params;
            const historial = await ClienteModel.getHistorialSuspensiones(id);
            res.json(historial);
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            res.status(500).json({ error: 'Error obteniendo historial de suspensiones' });
        }
    },

    // 🆕 OBTENER HISTORIAL DE MIGRACIONES
    getHistorialMigraciones: async (req, res) => {
        try {
            const { id } = req.params;
            const migraciones = await ClienteModel.getHistorialMigraciones(id);
            res.json(migraciones);
        } catch (error) {
            console.error('Error obteniendo migraciones:', error);
            res.status(500).json({ error: 'Error obteniendo historial de migraciones' });
        }
    },

    // 🆕 OBTENER HISTORIAL COMPLETO (Suspensiones + Migraciones)
    getHistorialCompleto: async (req, res) => {
        try {
            const { id } = req.params;
            const historial = await ClienteModel.getHistorialCompleto(id);
            res.json(historial);
        } catch (error) {
            console.error('Error obteniendo historial completo:', error);
            res.status(500).json({ error: 'Error obteniendo historial completo' });
        }
    }
};

module.exports = clienteController;
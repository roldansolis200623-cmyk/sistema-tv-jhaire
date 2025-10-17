const ClienteModel = require('../models/clienteModel');
const pool = require('../config/database');
const notificacionService = require('../services/notificacionService');

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

    // Crear nuevo cliente
    create: async (req, res) => {
        try {
            const nuevoCliente = await ClienteModel.create(req.body);
            
            // 🔔 NOTIFICACIÓN: Nuevo cliente registrado
            await notificacionService.notificarNuevoCliente(nuevoCliente);
            
            res.status(201).json({
                message: 'Cliente creado exitosamente',
                cliente: nuevoCliente
            });
        } catch (error) {
            console.error('Error creando cliente:', error);
            res.status(500).json({ error: 'Error creando cliente' });
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

    // SUSPENDER CLIENTE
    suspender: async (req, res) => {
        try {
            const { id } = req.params;
            const { motivo, observaciones, suspendido_por } = req.body;

            const cliente = await ClienteModel.getById(id);
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }

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

            // 🔔 NOTIFICACIÓN: Cliente suspendido
            await notificacionService.notificarClienteSuspendido(clienteSuspendido, motivo);

            res.json({
                message: 'Cliente suspendido exitosamente',
                cliente: clienteSuspendido
            });
        } catch (error) {
            console.error('Error suspendiendo cliente:', error);
            res.status(500).json({ error: 'Error suspendiendo cliente' });
        }
    },

    // REACTIVAR CLIENTE
    reactivar: async (req, res) => {
        try {
            const { id } = req.params;
            const { reactivado_por } = req.body;

            const cliente = await ClienteModel.getById(id);
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }

            const clienteReactivado = await ClienteModel.reactivar(id, reactivado_por || 'Administrador');
            await ClienteModel.registrarReactivacion(id, reactivado_por || 'Administrador');

            // 🔔 NOTIFICACIÓN: Cliente reactivado
            await notificacionService.notificarClienteReactivado(clienteReactivado);

            res.json({
                message: 'Cliente reactivado exitosamente',
                cliente: clienteReactivado
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
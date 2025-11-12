// ============================================
// backend/src/middlewares/validationMiddleware.js
// VALIDACIÓN EXHAUSTIVA DE INPUTS
// ============================================

const { body, param, query, validationResult } = require('express-validator');

// ============================================
// MANEJADOR DE ERRORES DE VALIDACIÓN
// ============================================
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Error de validación',
            details: errors.array().map(err => ({
                field: err.param,
                message: err.msg,
                value: err.value
            }))
        });
    }
    next();
};

// ============================================
// VALIDACIONES PARA PAGOS
// ============================================
const validatePago = [
    body('cliente_id')
        .isInt({ min: 1 })
        .withMessage('Cliente ID debe ser un número entero mayor a 0'),
    body('monto')
        .isFloat({ min: 0.01 })
        .withMessage('Monto debe ser un número mayor a 0.01'),
    body('metodo_pago')
        .isIn(['Efectivo', 'Tarjeta', 'Transferencia', 'Depósito'])
        .withMessage('Método de pago inválido'),
    body('fecha_pago')
        .isISO8601()
        .withMessage('Fecha debe ser formato ISO 8601 (YYYY-MM-DD)'),
    body('meses_pagados')
        .isInt({ min: 1, max: 12 })
        .withMessage('Meses debe estar entre 1 y 12'),
    body('observaciones')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Observaciones no debe exceder 500 caracteres'),
    handleValidationErrors
];

// ============================================
// VALIDACIONES PARA CLIENTES
// ============================================
const validateCliente = [
    body('nombre')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Nombre debe tener entre 2 y 50 caracteres'),
    body('apellido')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Apellido debe tener entre 2 y 50 caracteres'),
    body('dni')
        .trim()
        .matches(/^\d{8}$/)
        .withMessage('DNI debe tener exactamente 8 dígitos'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    body('telefono')
        .trim()
        .matches(/^9\d{8}$/)
        .withMessage('Teléfono debe tener 9 dígitos comenzando con 9'),
    body('precio_mensual')
        .isFloat({ min: 0 })
        .withMessage('Precio mensual debe ser un número válido'),
    body('estado')
        .optional()
        .isIn(['activo', 'suspendido', 'cancelado'])
        .withMessage('Estado inválido'),
    body('zona_geografica')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Zona geográfica no debe exceder 100 caracteres'),
    handleValidationErrors
];

// ============================================
// VALIDACIONES PARA ACTUALIZAR CLIENTE
// ============================================
const validateClienteUpdate = [
    body('nombre')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Nombre debe tener entre 2 y 50 caracteres'),
    body('apellido')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Apellido debe tener entre 2 y 50 caracteres'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    body('telefono')
        .optional()
        .trim()
        .matches(/^9\d{8}$/)
        .withMessage('Teléfono debe tener 9 dígitos comenzando con 9'),
    body('precio_mensual')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Precio mensual debe ser un número válido'),
    body('estado')
        .optional()
        .isIn(['activo', 'suspendido', 'cancelado'])
        .withMessage('Estado inválido'),
    handleValidationErrors
];

// ============================================
// VALIDACIONES PARA FILTROS Y PAGINACIÓN
// ============================================
const validatePagination = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 200 })
        .withMessage('Limit debe estar entre 1 y 200'),
    query('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset debe ser mayor o igual a 0'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page debe ser mayor a 0'),
    handleValidationErrors
];

const validateClienteFilters = [
    query('estado')
        .optional()
        .isIn(['activo', 'suspendido', 'cancelado'])
        .withMessage('Estado inválido'),
    query('zona')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Zona no válida'),
    query('search')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Búsqueda debe tener entre 2 y 100 caracteres'),
    ...validatePagination
];

// ============================================
// VALIDACIONES PARA REPORTES
// ============================================
const validateReporteFilters = [
    query('fecha_inicio')
        .optional()
        .isISO8601()
        .withMessage('Fecha inicio inválida'),
    query('fecha_fin')
        .optional()
        .isISO8601()
        .withMessage('Fecha fin inválida'),
    query('estado')
        .optional()
        .isIn(['pendiente', 'pagado', 'anulado'])
        .withMessage('Estado inválido'),
    ...validatePagination
];

// ============================================
// VALIDACIONES PARA INCIDENCIAS
// ============================================
const validateIncidencia = [
    body('cliente_id')
        .isInt({ min: 1 })
        .withMessage('Cliente ID inválido'),
    body('tipo')
        .isIn(['técnica', 'administrativa', 'servicio'])
        .withMessage('Tipo de incidencia inválido'),
    body('descripcion')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Descripción debe tener entre 10 y 1000 caracteres'),
    body('prioridad')
        .optional()
        .isIn(['baja', 'media', 'alta', 'crítica'])
        .withMessage('Prioridad inválida'),
    handleValidationErrors
];

// ============================================
// VALIDACIONES PARA NOTIFICACIONES
// ============================================
const validateNotificacionFilters = [
    query('leida')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('Leida debe ser true o false'),
    query('prioridad')
        .optional()
        .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
        .withMessage('Prioridad inválida'),
    query('tipo')
        .optional()
        .isString()
        .trim()
        .withMessage('Tipo inválido'),
    ...validatePagination
];

// ============================================
// VALIDACIONES DE PARÁMETROS
// ============================================
const validateIdParam = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID debe ser un número entero válido'),
    handleValidationErrors
];

const validateClienteIdParam = [
    param('clienteId')
        .isInt({ min: 1 })
        .withMessage('Cliente ID debe ser un número entero válido'),
    handleValidationErrors
];

// ============================================
// EXPORTAR
// ============================================
module.exports = {
    handleValidationErrors,
    validatePago,
    validateCliente,
    validateClienteUpdate,
    validatePagination,
    validateClienteFilters,
    validateReporteFilters,
    validateIncidencia,
    validateNotificacionFilters,
    validateIdParam,
    validateClienteIdParam
};
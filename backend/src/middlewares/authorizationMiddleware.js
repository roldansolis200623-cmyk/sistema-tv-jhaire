// ============================================
// backend/src/middlewares/authorizationMiddleware.js
// CONTROL DE ROLES Y PERMISOS (RBAC)
// ============================================

// ============================================
// VALIDAR ROLES ESPECÍFICOS
// ============================================
const requireRole = (requiredRoles) => {
    return (req, res, next) => {
        // Verificar que el usuario esté autenticado
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado. Por favor inicia sesión'
            });
        }

        // Si requiredRoles es string, convertir a array
        const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

        // Verificar que el usuario tenga uno de los roles requeridos
        if (!rolesArray.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                error: 'Permiso denegado. Rol insuficiente',
                requiredRoles: rolesArray,
                userRole: req.user.rol
            });
        }

        next();
    };
};

// ============================================
// SOLO ADMIN
// ============================================
const onlyAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autenticado'
        });
    }

    if (req.user.rol !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Solo administradores pueden acceder a esto'
        });
    }

    next();
};

// ============================================
// ADMIN O GERENTE
// ============================================
const adminOrManager = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autenticado'
        });
    }

    if (!['admin', 'gerente'].includes(req.user.rol)) {
        return res.status(403).json({
            success: false,
            error: 'Se requiere rol de administrador o gerente'
        });
    }

    next();
};

// ============================================
// PROPIETARIO DE RECURSO O ADMIN
// ============================================
const isOwnerOrAdmin = (resourceOwnerField = 'usuario_id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado'
            });
        }

        // Admin puede acceder a todo
        if (req.user.rol === 'admin') {
            return next();
        }

        // Verificar si el usuario es el propietario del recurso
        const resourceOwnerId = req.body?.[resourceOwnerField] || req.query?.[resourceOwnerField];
        
        if (resourceOwnerId && resourceOwnerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permiso para acceder a este recurso'
            });
        }

        next();
    };
};

// ============================================
// VERIFICAR MÚLTIPLES PERMISOS
// ============================================
const requirePermissions = (permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado'
            });
        }

        // Verificar cada permiso
        const userPermissions = getUserPermissionsByRole(req.user.rol);
        
        const hasAllPermissions = permissions.every(perm => 
            userPermissions.includes(perm)
        );

        if (!hasAllPermissions) {
            return res.status(403).json({
                success: false,
                error: 'Permisos insuficientes',
                requiredPermissions: permissions
            });
        }

        next();
    };
};

// ============================================
// OBTENER PERMISOS POR ROL
// ============================================
const getUserPermissionsByRole = (rol) => {
    const rolePermissions = {
        admin: [
            'read_all_clients',
            'create_client',
            'update_client',
            'delete_client',
            'read_payments',
            'create_payment',
            'delete_payment',
            'view_reports',
            'export_reports',
            'manage_users',
            'view_dashboard',
            'manage_notifications',
            'manage_cron',
            'manage_settings'
        ],
        gerente: [
            'read_all_clients',
            'create_client',
            'update_client',
            'read_payments',
            'create_payment',
            'view_reports',
            'export_reports',
            'view_dashboard',
            'manage_notifications'
        ],
        operador: [
            'read_all_clients',
            'create_client',
            'update_client',
            'read_payments',
            'create_payment',
            'view_dashboard'
        ],
        cliente: [
            'read_own_profile',
            'read_own_payments',
            'view_own_dashboard'
        ]
    };

    return rolePermissions[rol] || [];
};

// ============================================
// VALIDAR PERMISOS SEGÚN ACCIÓN
// ============================================
const checkAction = (action) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado'
            });
        }

        const allowedActions = {
            'read_clients': ['admin', 'gerente', 'operador'],
            'create_client': ['admin', 'gerente', 'operador'],
            'update_client': ['admin', 'gerente'],
            'delete_client': ['admin'],
            'view_payments': ['admin', 'gerente', 'operador'],
            'create_payment': ['admin', 'gerente', 'operador'],
            'delete_payment': ['admin'],
            'view_reports': ['admin', 'gerente'],
            'export_reports': ['admin'],
            'manage_settings': ['admin'],
            'view_dashboard': ['admin', 'gerente', 'operador'],
            'manage_notifications': ['admin'],
            'manage_cron': ['admin']
        };

        const allowedRoles = allowedActions[action] || [];

        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                error: `No tienes permiso para ${action}`,
                requiredRoles: allowedRoles
            });
        }

        next();
    };
};

// ============================================
// MIDDLEWARE PARA LOGGING DE ACCIONES
// ============================================
const logUserAction = (action) => {
    return (req, res, next) => {
        if (req.user) {
            console.log(`📝 [${new Date().toISOString()}] Usuario: ${req.user.id} | Acción: ${action} | Ruta: ${req.path}`);
        }
        next();
    };
};

// ============================================
// EXPORTAR
// ============================================
module.exports = {
    requireRole,
    onlyAdmin,
    adminOrManager,
    isOwnerOrAdmin,
    requirePermissions,
    getUserPermissionsByRole,
    checkAction,
    logUserAction
};
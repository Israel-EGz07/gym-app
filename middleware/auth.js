/**
 * Middleware de autenticación
 * Protege rutas verificando el JWT token
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============ PROTECCIÓN DE RUTAS ============

// Verificar token y proteger ruta
exports.protect = async (req, res, next) => {
  let token;

  // Verificar si el token está en los headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Verificar si el token existe
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado - No hay token de acceso'
    });
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret'
    );

    // Obtener usuario desde el token
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Usuario no encontrado'
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Cuenta desactivada'
      });
    }

    // Agregar usuario a la request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado - Token inválido o expirado'
    });
  }
};

// ============ VERIFICAR ROLES ============

// Verificar si es administrador
exports.admin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado - Se requiere permiso de administrador'
    });
  }
  next();
};

// Verificar múltiples roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Primero verificar si es admin
    if (req.user && req.user.isAdmin) {
      return next();
    }

    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado - Rol '${req.user?.role}' no autorizado`
      });
    }
    next();
  };
};

// ============ OPCIONAL: AUTENTICACIÓN ============

// Autenticación opcional - No falla si no hay token
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default_secret'
      );
      
      const user = await User.findByPk(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Token inválido, pero continuamos sin usuario
    }
  }

  next();
};

/**
 * Rutas de Usuarios
 * Perfil, estadísticas, edición
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Plan = require('../models/Plan');
const PaymentHistory = require('../models/PaymentHistory');
const { protect, admin } = require('../middleware/auth');

// ============ VALIDACIONES ============

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ max: 50 })
    .withMessage('El nombre no puede exceder 50 caracteres'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El apellido no puede exceder 50 caracteres'),
  
  body('phone')
    .optional()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Número de teléfono inválido'),
  
  body('gender')
    .optional()
    .isIn(['masculino', 'femenino', 'otro', 'no-especificado'])
    .withMessage('Género inválido'),
  
  body('fitnessLevel')
    .optional()
    .isIn(['principiante', 'intermedio', 'avanzado'])
    .withMessage('Nivel de condición física inválido')
];

// ============ RUTAS PÚBLICAS ============

/**
 * @route   GET /api/users/:id
 * @desc    Obtener perfil público de usuario
 * @access  Público
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'lastName', 'fitnessLevel', 'membershipStatus', 'statsVisits', 'statsTotalWorkouts']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        fitnessLevel: user.fitnessLevel,
        membershipStatus: user.membershipStatus,
        stats: {
          visits: user.statsVisits,
          totalWorkouts: user.statsTotalWorkouts
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario'
    });
  }
});

// ============ RUTAS PRIVADAS ============

/**
 * @route   GET /api/users/profile/me
 * @desc    Obtener perfil completo del usuario actual
 * @access  Privado
 */
router.get('/profile/me', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Plan, as: 'membership', attributes: ['id', 'name', 'price', 'durationText'] }
      ]
    });
    
    const payments = await PaymentHistory.findAll({
      where: { userId: user.id },
      include: [{ model: Plan, as: 'plan', attributes: ['id', 'name', 'price', 'durationText'] }],
      order: [['paymentDate', 'DESC']]
    });

    const userData = user.toJSON();
    userData.paymentHistory = payments;
    
    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil'
    });
  }
});

/**
 * @route   PUT /api/users/profile/me
 * @desc    Actualizar perfil del usuario actual
 * @access  Privado
 */
router.put('/profile/me', protect, updateProfileValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const user = await User.findByPk(req.user.id);

    const allowedFields = [
      'name', 'lastName', 'phone', 'birthDate', 'gender', 'fitnessLevel',
      'statsWeight', 'statsHeight', 'statsGoalWeight', 'statsVisits', 'statsTotalWorkouts'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil'
    });
  }
});

/**
 * @route   GET /api/users/stats
 * @desc    Obtener estadísticas del usuario
 * @access  Privado
 */
router.get('/stats/me', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'statsWeight', 'statsHeight', 'statsGoalWeight', 'statsVisits', 'statsTotalWorkouts', 'membershipStatus', 'membershipEnd', 'membershipId']
    });
    
    // Calcular días restantes de membresía
    let daysRemaining = 0;
    if (user.membershipEnd && new Date(user.membershipEnd) > new Date()) {
      const diff = new Date(user.membershipEnd) - new Date();
      daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    res.json({
      success: true,
      stats: {
        weight: user.statsWeight,
        height: user.statsHeight,
        goalWeight: user.statsGoalWeight,
        visits: user.statsVisits,
        totalWorkouts: user.statsTotalWorkouts,
        membershipStatus: user.membershipStatus,
        daysRemaining,
        membership: user.membershipId
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

/**
 * @route   GET /api/users/payment-history
 * @desc    Obtener historial de pagos
 * @access  Privado
 */
router.get('/payment-history/me', protect, async (req, res) => {
  try {
    const payments = await PaymentHistory.findAll({
      where: { userId: req.user.id },
      include: [{ model: Plan, as: 'planId', attributes: ['id', 'name', 'price', 'durationText'] }],
      order: [['paymentDate', 'DESC']]
    });

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de pagos'
    });
  }
});

// ============ RUTAS DE ADMINISTRADOR ============

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios
 * @access  Administrador
 */
router.get('/', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    const query = {};
    
    if (search) {
      query[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.like]: `%${search}%` } },
        { email: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }
    
    if (status) {
      query.membershipStatus = status;
    }

    const { count, rows } = await User.findAndCountAll({
      where: query,
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      users: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
});

/**
 * @route   GET /api/users/admin/stats
 * @desc    Obtener estadísticas de usuarios (admin)
 * @access  Administrador
 */
router.get('/admin/stats', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeMembers = await User.count({ where: { membershipStatus: 'activa' } });
    const expiredMembers = await User.count({ where: { membershipStatus: 'expirada' } });
    const inactiveUsers = await User.count({ where: { isActive: false } });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeMembers,
        expiredMembers,
        inactiveUsers
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

module.exports = router;

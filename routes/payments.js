/**
 * Rutas de Pagos
 * Sistema de pagos simulado
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Plan = require('../models/Plan');
const PaymentHistory = require('../models/PaymentHistory');
const { protect, admin } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// ============ VALIDACIONES ============

const paymentValidation = [
  body('planId')
    .notEmpty()
    .withMessage('El ID del plan es requerido'),
  
  body('paymentMethod')
    .isIn(['tarjeta', 'paypal', 'transferencia'])
    .withMessage('Método de pago inválido')
];

// ============ MIDDLEWARE DE SIMULACIÓN ============

const simulatePayment = async (paymentDetails) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const success = Math.random() > 0.1;
  
  if (success) {
    return {
      success: true,
      transactionId: `TXN-${uuidv4().slice(0, 8).toUpperCase()}`,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      status: 'completado',
      timestamp: new Date(),
      message: 'Pago procesado correctamente'
    };
  } else {
    return {
      success: false,
      transactionId: `TXN-${uuidv4().slice(0, 8).toUpperCase()}`,
      status: 'fallido',
      message: 'El pago fue rechazado. Intenta con otro método.'
    };
  }
};

// ============ RUTAS PÚBLICAS ============

/**
 * @route   GET /api/payments/methods
 * @desc    Obtener métodos de pago disponibles
 * @access  Público
 */
router.get('/methods', (req, res) => {
  res.json({
    success: true,
    methods: [
      {
        id: 'tarjeta',
        name: 'Tarjeta de crédito/débito',
        description: 'Visa, Mastercard, American Express',
        icon: 'credit-card',
        requiresDetails: true
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Paga con tu cuenta de PayPal',
        icon: 'paypal',
        requiresDetails: false
      },
      {
        id: 'transferencia',
        name: 'Transferencia bancaria',
        description: 'Transferencia directa a nuestra cuenta',
        icon: 'university',
        requiresDetails: false
      }
    ]
  });
});

// ============ RUTAS PRIVADAS ============

/**
 * @route   POST /api/payments
 * @desc    Procesar pago de membresía
 * @access  Privado
 */
router.post('/', protect, paymentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { planId, paymentMethod } = req.body;

    // Obtener plan
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan no encontrado'
      });
    }

    if (!plan.isActive) {
      return res.status(400).json({
        success: false,
        message: 'El plan no está disponible'
      });
    }

    // Calcular precio final
    const finalPrice = plan.getCurrentPrice ? plan.getCurrentPrice() : plan.price;

    // Simular procesamiento de pago
    const paymentResult = await simulatePayment({
      amount: finalPrice,
      currency: plan.currency,
      method: paymentMethod
    });

    if (!paymentResult.success) {
      // Registrar pago fallido
      await PaymentHistory.create({
        userId: req.user.id,
        planId: plan.id,
        amount: finalPrice,
        paymentDate: new Date(),
        paymentMethod,
        transactionId: paymentResult.transactionId,
        status: 'fallido'
      });

      return res.status(400).json({
        success: false,
        message: paymentResult.message,
        transactionId: paymentResult.transactionId
      });
    }

    // Calcular fechas de membresía
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    // Actualizar usuario con nueva membresía
    await User.update({
      membershipId: plan.id,
      membershipStart: startDate,
      membershipEnd: endDate,
      membershipStatus: 'activa'
    }, { where: { id: req.user.id } });

    // Registrar pago
    await PaymentHistory.create({
      userId: req.user.id,
      planId: plan.id,
      amount: finalPrice,
      paymentDate: new Date(),
      paymentMethod,
      transactionId: paymentResult.transactionId,
      status: 'completado'
    });

    res.json({
      success: true,
      message: 'Pago procesado correctamente',
      payment: {
        transactionId: paymentResult.transactionId,
        amount: finalPrice,
        currency: plan.currency,
        plan: plan.name,
        membershipStart: startDate,
        membershipEnd: endDate
      }
    });
  } catch (error) {
    console.error('Error al procesar pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar pago'
    });
  }
});

/**
 * @route   GET /api/payments/history
 * @desc    Obtener historial de pagos del usuario
 * @access  Privado
 */
router.get('/history', protect, async (req, res) => {
  try {
    const payments = await PaymentHistory.findAll({
      where: { userId: req.user.id },
      include: [{ model: Plan, as: 'plan', attributes: ['id', 'name', 'price', 'durationText'] }],
      order: [['paymentDate', 'DESC']]
    });

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial'
    });
  }
});

// ============ RUTAS DE ADMINISTRADOR ============

/**
 * @route   GET /api/payments/admin/all
 * @desc    Obtener todos los pagos
 * @access  Administrador
 */
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const { count, rows } = await PaymentHistory.findAndCountAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Plan, as: 'planId', attributes: ['id', 'name'] }
      ],
      order: [['paymentDate', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      payments: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos'
    });
  }
});

/**
 * @route   GET /api/payments/admin/stats
 * @desc    Obtener estadísticas de pagos
 * @access  Administrador
 */
router.get('/admin/stats', protect, admin, async (req, res) => {
  try {
    const payments = await PaymentHistory.findAll({
      where: { status: 'completado' }
    });

    let totalRevenue = 0;
    let paymentMethods = {};

    payments.forEach(payment => {
      totalRevenue += payment.amount;
      paymentMethods[payment.paymentMethod] = (paymentMethods[payment.paymentMethod] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        totalRevenue,
        paymentMethods,
        totalTransactions: payments.length
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

module.exports = router;

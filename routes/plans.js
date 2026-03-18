/**
 * Rutas de Planes/Membresías
 * CRUD de planes
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Plan = require('../models/Plan');
const { protect, admin } = require('../middleware/auth');

// ============ VALIDACIONES ============

const planValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del plan es requerido')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  
  body('duration')
    .isInt({ min: 1 })
    .withMessage('La duración debe ser al menos 1 día'),
  
  body('durationText')
    .isIn(['mensual', 'trimestral', 'semestral', 'anual'])
    .withMessage('Duración inválida')
];

// ============ RUTAS PÚBLICAS ============

/**
 * @route   GET /api/plans
 * @desc    Obtener todos los planes activos
 * @access  Público
 */
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC'], ['price', 'ASC']]
    });

    res.json({
      success: true,
      count: plans.length,
      plans
    });
  } catch (error) {
    console.error('Error al obtener planes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener planes'
    });
  }
});

/**
 * @route   GET /api/plans/featured
 * @desc    Obtener planes destacados
 * @access  Público
 */
router.get('/featured', async (req, res) => {
  try {
    const plans = await Plan.findAll({ 
      where: { isActive: true, isFeatured: true },
      order: [['displayOrder', 'ASC']]
    });

    res.json({
      success: true,
      count: plans.length,
      plans
    });
  } catch (error) {
    console.error('Error al obtener planes destacados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener planes'
    });
  }
});

/**
 * @route   GET /api/plans/popular
 * @desc    Obtener plan más popular
 * @access  Público
 */
router.get('/popular', async (req, res) => {
  try {
    const plan = await Plan.findOne({ 
      where: { isActive: true, popular: true }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'No hay plan popular disponible'
      });
    }

    res.json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('Error al obtener plan popular:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener plan'
    });
  }
});

/**
 * @route   GET /api/plans/:id
 * @desc    Obtener plan por ID
 * @access  Público
 */
router.get('/:id', async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan no encontrado'
      });
    }

    res.json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('Error al obtener plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener plan'
    });
  }
});

// ============ RUTAS DE ADMINISTRADOR ============

/**
 * @route   POST /api/plans
 * @desc    Crear nuevo plan
 * @access  Administrador
 */
router.post('/', protect, admin, planValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      shortDescription,
      price,
      currency,
      discountPrice,
      discountPercentage,
      duration,
      durationText,
      features,
      maxVisitsPerMonth,
      maxPersonalTrainerSessions,
      maxGroupClasses,
      image,
      imageAlt,
      color,
      popular,
      isFeatured,
      displayOrder
    } = req.body;

    const plan = await Plan.create({
      name,
      description,
      shortDescription,
      price,
      currency,
      discountPrice,
      discountPercentage,
      duration,
      durationText,
      features: features || [],
      maxVisitsPerMonth,
      maxPersonalTrainerSessions,
      maxGroupClasses,
      image,
      imageAlt,
      color,
      popular,
      isFeatured,
      displayOrder
    });

    res.status(201).json({
      success: true,
      message: 'Plan creado correctamente',
      plan
    });
  } catch (error) {
    console.error('Error al crear plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear plan'
    });
  }
});

/**
 * @route   PUT /api/plans/:id
 * @desc    Actualizar plan
 * @access  Administrador
 */
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan no encontrado'
      });
    }

    const allowedFields = [
      'name', 'description', 'shortDescription', 'price', 'currency',
      'discountPrice', 'discountPercentage', 'duration', 'durationText',
      'features', 'maxVisitsPerMonth', 'maxPersonalTrainerSessions',
      'maxGroupClasses', 'image', 'imageAlt', 'color', 'popular',
      'isActive', 'isFeatured', 'displayOrder'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        plan[field] = req.body[field];
      }
    });

    await plan.save();

    res.json({
      success: true,
      message: 'Plan actualizado',
      plan
    });
  } catch (error) {
    console.error('Error al actualizar plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar plan'
    });
  }
});

/**
 * @route   DELETE /api/plans/:id
 * @desc    Eliminar plan (soft delete)
 * @access  Administrador
 */
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan no encontrado'
      });
    }

    plan.isActive = false;
    await plan.save();

    res.json({
      success: true,
      message: 'Plan eliminado'
    });
  } catch (error) {
    console.error('Error al eliminar plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar plan'
    });
  }
});

module.exports = router;

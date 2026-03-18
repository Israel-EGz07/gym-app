/**
 * Rutas de Comentarios
 * Reseñas y comentarios de usuarios
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { protect, admin, optionalAuth } = require('../middleware/auth');

// ============ VALIDACIONES ============

const commentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('El contenido del comentario es requerido')
    .isLength({ min: 3, max: 1000 })
    .withMessage('El comentario debe tener entre 3 y 1000 caracteres'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe ser entre 1 y 5')
];

// ============ RUTAS PÚBLICAS ============

/**
 * @route   GET /api/comments
 * @desc    Obtener comentarios aprobados
 * @access  Público
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const { count, rows } = await Comment.findAndCountAll({
      where: { status: 'aprobado' },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'lastName'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      comments: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener comentarios'
    });
  }
});

/**
 * @route   GET /api/comments/stats
 * @desc    Obtener estadísticas de comentarios
 * @access  Público
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await Comment.getStats();
    
    // Obtener distribución de ratings
    const comments = await Comment.findAll({
      where: { status: 'aprobado' },
      attributes: ['rating']
    });
    
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    comments.forEach(comment => {
      const rating = Math.round(comment.rating);
      if (ratingDistribution[rating] !== undefined) {
        ratingDistribution[rating]++;
      }
    });
    
    res.json({
      success: true,
      stats,
      ratingDistribution
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

// ============ RUTAS PRIVADAS ============

/**
 * @route   POST /api/comments
 * @desc    Crear nuevo comentario
 * @access  Privado
 */
router.post('/', protect, commentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { content, rating, title, type } = req.body;

    const comment = await Comment.create({
      userId: req.user.id,
      content,
      rating: rating || 5,
      title: title || '',
      type: type || 'resena',
      ipAddress: req.ip
    });

    await comment.setUser(req.user.id);

    res.status(201).json({
      success: true,
      message: '¡Comentario publicado exitosamente!',
      comment
    });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear comentario'
    });
  }
});

/**
 * @route   PUT /api/comments/:id/like
 * @desc    Dar like a comentario
 * @access  Privado
 */
router.put('/:id/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    await comment.toggleLike(req.user.id);

    res.json({
      success: true,
      likesCount: comment.likes?.length || 0,
      dislikesCount: comment.dislikes?.length || 0
    });
  } catch (error) {
    console.error('Error al dar like:', error);
    res.status(500).json({
      success: false,
      message: 'Error al dar like'
    });
  }
});

// ============ RUTAS DE ADMINISTRADOR ============

/**
 * @route   GET /api/comments/admin/all
 * @desc    Obtener todos los comentarios (moderación)
 * @access  Administrador
 */
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Comment.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      comments: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Error al obtener comentarios (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener comentarios'
    });
  }
});

/**
 * @route   PUT /api/comments/admin/:id/approve
 * @desc    Aprobar comentario
 * @access  Administrador
 */
router.put('/admin/:id/approve', protect, admin, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    await comment.approve(req.user.id, req.body.note);

    res.json({
      success: true,
      message: 'Comentario aprobado'
    });
  } catch (error) {
    console.error('Error al aprobar comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar comentario'
    });
  }
});

/**
 * @route   PUT /api/comments/admin/:id/reject
 * @desc    Rechazar comentario
 * @access  Administrador
 */
router.put('/admin/:id/reject', protect, admin, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    await comment.reject(req.user.id, req.body.note);

    res.json({
      success: true,
      message: 'Comentario rechazado'
    });
  } catch (error) {
    console.error('Error al rechazar comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar comentario'
    });
  }
});

module.exports = router;

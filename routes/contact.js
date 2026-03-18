/**
 * Rutas de Contacto
 * Formulario de contacto y mensajes
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// ============ VALIDACIONES ============

const contactValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres'),
  
  body('email')
    .isEmail()
    .withMessage('Por favor ingresa un correo electrónico válido')
    .normalizeEmail(),
  
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('El asunto es requerido')
    .isLength({ max: 200 })
    .withMessage('El asunto no puede exceder 200 caracteres'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('El mensaje es requerido')
    .isLength({ min: 10, max: 2000 })
    .withMessage('El mensaje debe tener entre 10 y 2000 caracteres')
];

// ============ RUTAS PÚBLICAS ============

/**
 * @route   POST /api/contact
 * @desc    Enviar mensaje de contacto
 * @access  Público
 */
router.post('/', contactValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { name, email, phone, subject, message, category } = req.body;

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
      category: category || 'general',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado correctamente. Te responderemos pronto.',
      contactId: contact.id
    });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar mensaje'
    });
  }
});

/**
 * @route   GET /api/contact/info
 * @desc    Obtener información de contacto del gimnasio
 * @access  Público
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    info: {
      name: 'FitLife Gym',
      description: 'Tu centro de fitness moderno y equipado con las mejores instalaciones',
      address: {
        street: 'Av. Principal 123',
        city: 'Ciudad de México',
        state: 'CDMX',
        zip: '01000',
        country: 'México'
      },
      phone: '+52 55 1234 5678',
      email: 'contacto@fitlifegym.com',
      whatsapp: '+52 55 1234 5678',
      socialMedia: {
        facebook: 'https://facebook.com/fitlifegym',
        instagram: 'https://instagram.com/fitlifegym',
        twitter: 'https://twitter.com/fitlifegym',
        youtube: 'https://youtube.com/fitlifegym'
      },
      hours: {
        monday: { open: '06:00', close: '23:00' },
        tuesday: { open: '06:00', close: '23:00' },
        wednesday: { open: '06:00', close: '23:00' },
        thursday: { open: '06:00', close: '23:00' },
        friday: { open: '06:00', close: '23:00' },
        saturday: { open: '08:00', close: '21:00' },
        sunday: { open: '08:00', close: '21:00' }
      }
    }
  });
});

/**
 * @route   GET /api/contact/faq
 * @desc    Obtener preguntas frecuentes
 * @access  Público
 */
router.get('/faq', (req, res) => {
  res.json({
    success: true,
    faqs: [
      {
        question: '¿Cuáles son los horarios del gimnasio?',
        answer: 'Abrimos de lunes a viernes de 6:00 AM a 11:00 PM, y fines de semana de 8:00 AM a 9:00 PM.'
      },
      {
        question: '¿Puedo ir a probar un día gratis?',
        answer: '¡Sí! Ofrecemos un día de prueba gratuito para que conozcas nuestras instalaciones.'
      },
      {
        question: '¿Qué incluye la membresía básica?',
        answer: 'La membresía básica incluye acceso al gimnasio, vestuarios, regaderas y lockers.'
      },
      {
        question: '¿Tienen clases grupales?',
        answer: 'Sí, con la membresía Premium y VIP tienes acceso ilimitado a todas nuestras clases grupales.'
      },
      {
        question: '¿Cómo puedo cancelar mi membresía?',
        answer: 'Puedes cancelar en cualquier momento desde tu perfil o visitando nuestra recepción.'
      },
      {
        question: '¿Tienen estacionamiento?',
        answer: 'Sí, tenemos estacionamiento gratuito para todos nuestros miembros.'
      }
    ]
  });
});

// ============ RUTAS DE ADMINISTRADOR ============

/**
 * @route   GET /api/contact/admin/all
 * @desc    Obtener todos los mensajes
 * @access  Administrador
 */
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const { count, rows } = await Contact.findAndCountAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      messages: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Error al obtener mensajes (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes'
    });
  }
});

/**
 * @route   GET /api/contact/admin/stats
 * @desc    Obtener estadísticas de contactos
 * @access  Administrador
 */
router.get('/admin/stats', protect, admin, async (req, res) => {
  try {
    const stats = await Contact.getStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

module.exports = router;

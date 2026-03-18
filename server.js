/**
 * Servidor principal de la aplicación de Gimnasio
 * Express + SQLite + JWT
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Importar modelos y configuración de DB
const sequelize = require('./config/database');
const User = require('./models/User');
const Plan = require('./models/Plan');
const Comment = require('./models/Comment');
const Contact = require('./models/Contact');
const PaymentHistory = require('./models/PaymentHistory');

// ============ ASOCIACIONES DE MODELOS ============

// User - PaymentHistory (uno a muchos)
User.hasMany(PaymentHistory, { foreignKey: 'userId', as: 'payments' });
PaymentHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Plan - PaymentHistory (uno a muchos)
Plan.hasMany(PaymentHistory, { foreignKey: 'planId', as: 'payments' });
PaymentHistory.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

// User - Comment (uno a muchos)
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const planRoutes = require('./routes/plans');
const paymentRoutes = require('./routes/payments');
const commentRoutes = require('./routes/comments');
const contactRoutes = require('./routes/contact');

const app = express();

// ============ MIDDLEWARE DE SEGURIDAD ============

// Helmet: Protege headers HTTP
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS: Control de acceso
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

// Morgan: Logging de solicitudes
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============ MIDDLEWARE GENERAL ============

// Body parser - Limitar tamaño para prevenir DoS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/build')));
}

// ============ RUTAS DE LA API ============

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/contact', contactRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API del Gimnasio - Funcionando correctamente',
    version: '1.0.0',
    database: 'SQLite',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      plans: '/api/plans',
      payments: '/api/payments',
      comments: '/api/comments',
      contact: '/api/contact'
    }
  });
});

// ============ MANEJO DE ERRORES ============

// 404 - Ruta no encontrada
app.use((req, res, next) => {
  const error = new Error('Ruta no encontrada');
  error.status = 404;
  next(error);
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============ SINCRONIZACIÓN Y INICIO ============

const PORT = process.env.PORT || 5000;

// Función para sincronizar DB y crear datos iniciales
const syncDatabase = async () => {
  try {
    // Sincronizar modelos (crear tablas)
    await sequelize.sync({ force: false });
    console.log('✅ Base de datos SQLite sincronizada');
    
    // Crear planes de ejemplo si no existen
    const plansCount = await Plan.count();
    if (plansCount === 0) {
      await Plan.bulkCreate([
        {
          name: 'Básico',
          description: 'Perfecto para comenzar tu camino fitness. Acceso básico a todas las instalaciones del gimnasio.',
          shortDescription: 'Acceso básico a instalaciones',
          price: 499,
          currency: 'MXN',
          duration: 30,
          durationText: 'mensual',
          features: [
            { name: 'Acceso a gimnasio', included: true },
            { name: 'Vestuarios y regaderas', included: true },
            { name: 'Lockers', included: true },
            { name: 'Clases grupales', included: false },
            { name: 'Entrenador personal', included: false },
            { name: 'Sauna', included: false }
          ],
          color: '#6c757d',
          displayOrder: 1
        },
        {
          name: 'Premium',
          description: 'La experiencia completa. Acceso ilimitado a clases grupales, zona de cardio y más beneficios.',
          shortDescription: 'Acceso ilimitado a todo',
          price: 799,
          currency: 'MXN',
          discountPercentage: 15,
          duration: 30,
          durationText: 'mensual',
          features: [
            { name: 'Acceso a gimnasio', included: true },
            { name: 'Vestuarios y regaderas', included: true },
            { name: 'Lockers', included: true },
            { name: 'Clases grupales ilimitadas', included: true },
            { name: 'Zona de cardio', included: true },
            { name: 'Sauna', included: true },
            { name: 'Entrenador personal', included: false }
          ],
          color: '#007bff',
          isFeatured: true,
          popular: false,
          displayOrder: 2
        },
        {
          name: 'VIP',
          description: 'La experiencia premium total. Incluye sesiones con entrenador personal y beneficios exclusivos.',
          shortDescription: 'Todo incluido + entrenador',
          price: 1499,
          currency: 'MXN',
          discountPercentage: 20,
          duration: 30,
          durationText: 'mensual',
          features: [
            { name: 'Acceso a gimnasio', included: true },
            { name: 'Vestuarios VIP', included: true },
            { name: 'Lockers privado', included: true },
            { name: 'Clases grupales ilimitadas', included: true },
            { name: 'Zona de cardio VIP', included: true },
            { name: 'Sauna y spa', included: true },
            { name: 'Sesiones con entrenador personal', included: true },
            { name: 'Evaluación corporal gratuita', included: true }
          ],
          color: '#ffc107',
          isFeatured: true,
          popular: true,
          displayOrder: 3
        },
        {
          name: 'Anual',
          description: 'Ahorra más con el plan anual. Un año completo de membresía con todos los beneficios premium.',
          shortDescription: 'Ahorra con membresía anual',
          price: 7999,
          currency: 'MXN',
          discountPercentage: 35,
          duration: 365,
          durationText: 'anual',
          features: [
            { name: 'Acceso a gimnasio', included: true },
            { name: 'Vestuarios VIP', included: true },
            { name: 'Lockers privado', included: true },
            { name: 'Clases grupales ilimitadas', included: true },
            { name: 'Zona de cardio VIP', included: true },
            { name: 'Sauna y spa', included: true },
            { name: 'Sesiones con entrenador personal', included: true },
            { name: 'Evaluación corporal gratuita', included: true },
            { name: 'Descuentos en tienda', included: true },
            { name: 'Invitar amigos (2 al mes)', included: true }
          ],
          color: '#28a745',
          isFeatured: true,
          popular: false,
          displayOrder: 4
        }
      ]);
      console.log('✅ Planes de ejemplo creados');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Base de datos: SQLite`);
    });
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
  }
};

syncDatabase();

module.exports = app;

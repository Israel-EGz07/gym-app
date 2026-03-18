/**
 * Modelo de Comentario para SQLite
 * Sistema de comentarios y reseñas de usuarios
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Usuario que hace el comentario
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  
  // Contenido del comentario
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  // Calificación (1-5 estrellas)
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: { min: 1, max: 5 }
  },
  
  // Título del comentario
  title: {
    type: DataTypes.STRING
  },
  
  // Estado del comentario
  status: {
    type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado', 'reportado'),
    defaultValue: 'aprobado'
  },
  
  // Moderación
  moderatedBy: {
    type: DataTypes.UUID
  },
  moderatedAt: {
    type: DataTypes.DATE
  },
  moderationNote: {
    type: DataTypes.TEXT
  },
  
  // Respuesta del administrador
  adminResponse: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('adminResponse');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('adminResponse', value ? JSON.stringify(value) : null);
    }
  },
  
  // Utilidades (stored as JSON)
  likes: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('likes');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('likes', JSON.stringify(value || []));
    }
  },
  dislikes: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('dislikes');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('dislikes', JSON.stringify(value || []));
    }
  },
  
  // Tipo de comentario
  type: {
    type: DataTypes.ENUM('resena', 'pregunta', 'sugerencia'),
    defaultValue: 'resena'
  },
  
  // IP del usuario
  ipAddress: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'comments'
});

// Métodos
Comment.prototype.approve = function(moderatorId, note = '') {
  this.status = 'aprobado';
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  if (note) this.moderationNote = note;
  return this.save();
};

Comment.prototype.reject = function(moderatorId, note = '') {
  this.status = 'rechazado';
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  if (note) this.moderationNote = note;
  return this.save();
};

Comment.prototype.toggleLike = function(userId) {
  const userIdStr = userId.toString();
  let likes = this.likes || [];
  const dislikeIndex = likes.indexOf(userIdStr);
  
  if (dislikeIndex > -1) {
    likes.splice(dislikeIndex, 1);
  } else {
    likes.push(userIdStr);
  }
  
  this.likes = likes;
  return this.save();
};

Comment.prototype.toggleDislike = function(userId) {
  const userIdStr = userId.toString();
  let dislikes = this.dislikes || [];
  const likeIndex = dislikes.indexOf(userIdStr);
  
  if (likeIndex > -1) {
    dislikes.splice(likeIndex, 1);
  } else {
    dislikes.push(userIdStr);
  }
  
  this.dislikes = dislikes;
  return this.save();
};

// Método estático para estadísticas
Comment.getStats = async function() {
  const total = await this.count();
  const approved = await this.count({ where: { status: 'aprobado' } });
  const pending = await this.count({ where: { status: 'pendiente' } });
  const rejected = await this.count({ where: { status: 'rechazado' } });
  const reported = await this.count({ where: { status: 'reportado' } });
  
  const avgResult = await this.findOne({
    where: { status: 'aprobado' },
    attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']]
  });
  
  return {
    total,
    approved,
    pending,
    rejected,
    reported,
    averageRating: avgResult?.dataValues?.avgRating ? parseFloat(avgResult.dataValues.avgRating).toFixed(1) : 0
  };
};

module.exports = Comment;

/**
 * Modelo de Usuario para SQLite
 * Sistema de autenticación y perfil de usuario
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Datos de autenticación
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // Datos personales
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING
  },
  phone: {
    type: DataTypes.STRING
  },
  birthDate: {
    type: DataTypes.DATE
  },
  gender: {
    type: DataTypes.ENUM('masculino', 'femenino', 'otro', 'no-especificado'),
    defaultValue: 'no-especificado'
  },
  
  // Información de membresía
  membershipId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  membershipStart: {
    type: DataTypes.DATE
  },
  membershipEnd: {
    type: DataTypes.DATE
  },
  membershipStatus: {
    type: DataTypes.ENUM('activa', 'expirada', 'cancelada', 'ninguna'),
    defaultValue: 'ninguna'
  },
  
  // Estadísticas del usuario
  statsWeight: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  statsHeight: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  statsGoalWeight: {
    type: DataTypes.FLOAT
  },
  statsVisits: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  statsTotalWorkouts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Preferencias
  fitnessLevel: {
    type: DataTypes.ENUM('principiante', 'intermedio', 'avanzado'),
    defaultValue: 'principiante'
  },
  
  // Estado de la cuenta
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastLogin: {
    type: DataTypes.DATE
  },
  
  // Tokens de recuperación
  resetPasswordToken: {
    type: DataTypes.STRING
  },
  resetPasswordExpire: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Métodos de instancia
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this.id, isAdmin: this.isAdmin },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

User.prototype.getResetPasswordToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
  
  return resetToken;
};

User.prototype.isMembershipActive = function() {
  if (!this.membershipEnd) return false;
  return new Date(this.membershipEnd) > new Date();
};

// Transformar salida JSON
User.prototype.toJSON = function() {
  const user = { ...this.get() };
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  return user;
};

module.exports = User;

/**
 * Modelo de Plan/Membresía para SQLite
 * Distintos tipos de membresías del gimnasio
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Información básica
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  shortDescription: {
    type: DataTypes.STRING
  },
  
  // Precios
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'MXN'
  },
  discountPrice: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  discountPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Duración
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  durationText: {
    type: DataTypes.ENUM('mensual', 'trimestral', 'semestral', 'anual'),
    defaultValue: 'mensual'
  },
  
  // Características (stored as JSON string)
  features: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('features');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('features', JSON.stringify(value || []));
    }
  },
  
  // Límites
  maxVisitsPerMonth: {
    type: DataTypes.INTEGER,
    defaultValue: -1
  },
  maxPersonalTrainerSessions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  maxGroupClasses: {
    type: DataTypes.INTEGER,
    defaultValue: -1
  },
  
  // Imagen
  image: {
    type: DataTypes.STRING,
    defaultValue: '/images/plans/default.jpg'
  },
  imageAlt: {
    type: DataTypes.STRING
  },
  
  // Color para UI
  color: {
    type: DataTypes.STRING,
    defaultValue: '#007bff'
  },
  popular: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Estado
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Orden de visualización
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'plans'
});

// Métodos
Plan.prototype.getCurrentPrice = function() {
  if (this.discountPrice > 0) {
    return this.discountPrice;
  }
  if (this.discountPercentage > 0) {
    return this.price * (1 - this.discountPercentage / 100);
  }
  return this.price;
};

Plan.prototype.hasDiscount = function() {
  return this.discountPrice > 0 || this.discountPercentage > 0;
};

module.exports = Plan;

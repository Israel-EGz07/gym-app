/**
 * Modelo de Historial de Pagos para SQLite
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentHistory = sequelize.define('PaymentHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  planId: {
    type: DataTypes.UUID
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  paymentMethod: {
    type: DataTypes.STRING
  },
  transactionId: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('completado', 'pendiente', 'fallido', 'reembolsado'),
    defaultValue: 'completado'
  }
}, {
  tableName: 'payment_history',
  timestamps: false
});

module.exports = PaymentHistory;

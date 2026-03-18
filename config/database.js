/**
 * Configuración de Base de Datos SQLite
 * Usando Sequelize como ORM
 */

const { Sequelize } = require('sequelize');
const path = require('path');

// Crear conexión SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false, // Cambiar a console.log para ver queries
  define: {
    timestamps: true,
    underscored: true
  }
});

module.exports = sequelize;

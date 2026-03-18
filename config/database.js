/**
 * Configuración de Base de Datos PostgreSQL
 * Usando Sequelize como ORM
 * Compatible con Netlify y Neon
 */

const { Sequelize } = require('sequelize');

// Usar DATABASE_URL si está disponible (producción), si no usar configuración local
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      define: {
        timestamps: true,
        underscored: true
      }
    })
  : new Sequelize({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'gymapp',
      username: 'postgres',
      password: 'postgres',
      logging: false,
      define: {
        timestamps: true,
        underscored: true
      }
    });

module.exports = sequelize;

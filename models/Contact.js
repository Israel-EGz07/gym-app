/**
 * Modelo de Contacto para SQLite
 * Mensajes del formulario de contacto
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Datos del contacto
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true }
  },
  phone: {
    type: DataTypes.STRING
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  // Información adicional
  ipAddress: {
    type: DataTypes.STRING
  },
  userAgent: {
    type: DataTypes.STRING
  },
  
  // Estado del mensaje
  status: {
    type: DataTypes.ENUM('nuevo', 'leido', 'respondido', 'archivado'),
    defaultValue: 'nuevo'
  },
  
  // Prioridad
  priority: {
    type: DataTypes.ENUM('baja', 'normal', 'alta', 'urgente'),
    defaultValue: 'normal'
  },
  
  // Categoría
  category: {
    type: DataTypes.ENUM('general', 'ventas', 'soporte', 'quejas', 'sugerencias', 'otro'),
    defaultValue: 'general'
  },
  
  // Respuesta
  response: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('response');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('response', value ? JSON.stringify(value) : null);
    }
  },
  
  // Información del usuario logueado
  userId: {
    type: DataTypes.UUID
  }
}, {
  tableName: 'contacts'
});

// Métodos
Contact.prototype.markAsRead = function() {
  this.status = 'leido';
  return this.save();
};

Contact.prototype.respond = function(adminId, content) {
  this.status = 'respondido';
  this.response = {
    content,
    respondedAt: new Date(),
    respondedBy: adminId
  };
  return this.save();
};

Contact.prototype.archive = function() {
  this.status = 'archivado';
  return this.save();
};

// Método estático
Contact.getStats = async function() {
  const total = await this.count();
  const unread = await this.count({ where: { status: 'nuevo' } });
  const read = await this.count({ where: { status: 'leido' } });
  const responded = await this.count({ where: { status: 'respondido' } });
  const archived = await this.count({ where: { status: 'archivado' } });
  
  // Por categoría
  const categories = await this.findAll({
    attributes: [
      'category',
      [sequelize.fn('COUNT', sequelize.col('category')), 'count']
    ],
    group: ['category']
  });
  
  const byCategory = categories.reduce((acc, item) => {
    acc[item.category] = item.dataValues.count;
    return acc;
  }, {});
  
  return {
    total,
    unread,
    read,
    responded,
    archived,
    byCategory
  };
};

module.exports = Contact;

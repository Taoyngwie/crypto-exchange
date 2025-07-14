const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }
});

// Model Methods
User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Associations will be defined later
User.associate = (models) => {
  User.hasMany(models.Wallet, { foreignKey: 'user_id' });
  User.hasMany(models.Order, { foreignKey: 'user_id' });
  User.hasMany(models.P2POffer, { foreignKey: 'seller_id', as: 'offers' });
};

module.exports = User;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FiatCurrency = sequelize.define('FiatCurrency', {
  fiat_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(3),
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  symbol: {
    type: DataTypes.STRING(5),
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

FiatCurrency.associate = (models) => {
  FiatCurrency.hasMany(models.Order, { foreignKey: 'fiat_id' });
};

module.exports = FiatCurrency;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cryptocurrency = sequelize.define('Cryptocurrency', {
  crypto_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  symbol: {
    type: DataTypes.STRING(10),
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  decimal_places: {
    type: DataTypes.INTEGER,
    defaultValue: 8
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Model Methods
Cryptocurrency.prototype.getWallets = async function() {
  const Wallet = require('./Wallet');
  return await Wallet.findAll({
    where: { crypto_id: this.crypto_id }
  });
};

Cryptocurrency.associate = (models) => {
  Cryptocurrency.hasMany(models.Wallet, { foreignKey: 'crypto_id' });
  Cryptocurrency.hasMany(models.Order, { foreignKey: 'crypto_id' });
};

module.exports = Cryptocurrency;
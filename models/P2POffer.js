const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const P2POffer = sequelize.define('P2POffer', {
  offer_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  min_amount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  max_amount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  price_per_coin: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  offer_type: {
    type: DataTypes.ENUM('buy', 'sell'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    defaultValue: 'active'
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  crypto_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fiat_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Model Methods
P2POffer.prototype.getSeller = async function() {
  const User = require('./User');
  return await User.findByPk(this.seller_id);
};

P2POffer.prototype.getCryptocurrency = async function() {
  const Cryptocurrency = require('./Cryptocurrency');
  return await Cryptocurrency.findByPk(this.crypto_id);
};


module.exports = P2POffer;

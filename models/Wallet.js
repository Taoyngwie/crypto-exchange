const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wallet = sequelize.define('Wallet', {
  wallet_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  wallet_address: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  balance: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0.00000000
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  crypto_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Model Methods
Wallet.prototype.getUser = async function() {
  const User = require('./User');
  return await User.findByPk(this.user_id);
};

Wallet.prototype.getCryptocurrency = async function() {
  const Cryptocurrency = require('./Cryptocurrency');
  return await Cryptocurrency.findByPk(this.crypto_id);
};

Wallet.prototype.getTransactions = async function() {
  const Transaction = require('./Transaction');
  return await Transaction.findAll({
    where: {
      [sequelize.Op.or]: [
        { from_wallet_id: this.wallet_id },
        { to_wallet_id: this.wallet_id }
      ]
    }
  });
};



module.exports = Wallet;
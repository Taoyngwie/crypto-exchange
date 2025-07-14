const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  transaction_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tx_type: {
    type: DataTypes.ENUM('trade', 'transfer_internal', 'transfer_external', 'deposit', 'withdrawal'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false
  },
  tx_hash: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true // null for internal transfers
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'failed'),
    defaultValue: 'pending'
  },
  from_wallet_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  to_wallet_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Model Methods
Transaction.prototype.getFromWallet = async function() {
  const Wallet = require('./Wallet');
  return await Wallet.findByPk(this.from_wallet_id);
};

Transaction.prototype.getToWallet = async function() {
  const Wallet = require('./Wallet');
  return await Wallet.findByPk(this.to_wallet_id);
};

Transaction.prototype.getOrder = async function() {
  const Order = require('./Order');
  return await Order.findByPk(this.order_id);
};

Transaction.associate = (models) => {
  Transaction.belongsTo(models.Wallet, { foreignKey: 'from_wallet_id', as: 'fromWallet' });
  Transaction.belongsTo(models.Wallet, { foreignKey: 'to_wallet_id', as: 'toWallet' });
  Transaction.belongsTo(models.Order, { foreignKey: 'order_id' });
};

module.exports = Transaction;
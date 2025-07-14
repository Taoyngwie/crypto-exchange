const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  order_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_type: {
    type: DataTypes.ENUM('buy', 'sell'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  user_id: {
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
Order.prototype.getUser = async function() {
  const User = require('./User');
  return await User.findByPk(this.user_id);
};

Order.prototype.getCryptocurrency = async function() {
  const Cryptocurrency = require('./Cryptocurrency');
  return await Cryptocurrency.findByPk(this.crypto_id);
};

Order.prototype.getFiatCurrency = async function() {
  const FiatCurrency = require('./FiatCurrency');
  return await FiatCurrency.findByPk(this.fiat_id);
};

Order.prototype.getTransaction = async function() {
  const Transaction = require('./Transaction');
  return await Transaction.findOne({ where: { order_id: this.order_id } });
};

Order.associate = (models) => {
  Order.belongsTo(models.User, { foreignKey: 'user_id' });
  Order.belongsTo(models.Cryptocurrency, { foreignKey: 'crypto_id' });
  Order.belongsTo(models.FiatCurrency, { foreignKey: 'fiat_id' });
  Order.hasOne(models.Transaction, { foreignKey: 'order_id' });
};

module.exports = Order;
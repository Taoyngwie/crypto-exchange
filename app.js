// app.js
const express = require('express');
const sequelize = require('./config/database');
const routes = require('./routes');

// Import all models
const User = require('./models/User');
const Cryptocurrency = require('./models/Cryptocurrency');
const FiatCurrency = require('./models/FiatCurrency');
const Wallet = require('./models/Wallet');
const Order = require('./models/Order');
const Transaction = require('./models/Transaction');
const P2POffer = require('./models/P2POffer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Define all associations here
function setupAssociations() {
  // User associations
  User.hasMany(Wallet, { foreignKey: 'user_id' });
  User.hasMany(Order, { foreignKey: 'user_id' });
  User.hasMany(P2POffer, { foreignKey: 'seller_id', as: 'offers' });

  // Wallet associations
  Wallet.belongsTo(User, { foreignKey: 'user_id' });
  Wallet.belongsTo(Cryptocurrency, { foreignKey: 'crypto_id' });
  Wallet.hasMany(Transaction, { foreignKey: 'from_wallet_id', as: 'sentTransactions' });
  Wallet.hasMany(Transaction, { foreignKey: 'to_wallet_id', as: 'receivedTransactions' });

  // Cryptocurrency associations
  Cryptocurrency.hasMany(Wallet, { foreignKey: 'crypto_id' });
  Cryptocurrency.hasMany(Order, { foreignKey: 'crypto_id' });
  Cryptocurrency.hasMany(P2POffer, { foreignKey: 'crypto_id' });

  // FiatCurrency associations
  FiatCurrency.hasMany(Order, { foreignKey: 'fiat_id' });
  FiatCurrency.hasMany(P2POffer, { foreignKey: 'fiat_id' });

  // Order associations
  Order.belongsTo(User, { foreignKey: 'user_id' });
  Order.belongsTo(Cryptocurrency, { foreignKey: 'crypto_id' });
  Order.belongsTo(FiatCurrency, { foreignKey: 'fiat_id' });
  Order.hasOne(Transaction, { foreignKey: 'order_id' });

  // Transaction associations
  Transaction.belongsTo(Wallet, { foreignKey: 'from_wallet_id', as: 'fromWallet' });
  Transaction.belongsTo(Wallet, { foreignKey: 'to_wallet_id', as: 'toWallet' });
  Transaction.belongsTo(Order, { foreignKey: 'order_id' });

  // P2POffer associations
  P2POffer.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });
  P2POffer.belongsTo(Cryptocurrency, { foreignKey: 'crypto_id' });
  P2POffer.belongsTo(FiatCurrency, { foreignKey: 'fiat_id' });
}

// Start server
async function start() {
  try {
    // Setup associations before starting
    setupAssociations();
    
    await sequelize.authenticate();
    console.log('Database connection established');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

start();
const sequelize = require('../config/database');
const User = require('../models/User');
const Cryptocurrency = require('../models/Cryptocurrency');
const FiatCurrency = require('../models/FiatCurrency');
const Wallet = require('../models/Wallet');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const P2POffer = require('../models/P2POffer');
const { generateWalletAddress } = require('../utils/crypto');

async function seed() {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synced');
    
    // Create Cryptocurrencies
    const btc = await Cryptocurrency.create({
      symbol: 'BTC',
      name: 'Bitcoin',
      decimal_places: 8
    });
    
    const eth = await Cryptocurrency.create({
      symbol: 'ETH',
      name: 'Ethereum',
      decimal_places: 18
    });
    
    const xrp = await Cryptocurrency.create({
      symbol: 'XRP',
      name: 'Ripple',
      decimal_places: 6
    });
    
    const doge = await Cryptocurrency.create({
      symbol: 'DOGE',
      name: 'Dogecoin',
      decimal_places: 8
    });
    
    console.log('Cryptocurrencies created');
    
    // Create Fiat Currencies
    const thb = await FiatCurrency.create({
      code: 'THB',
      name: 'Thai Baht',
      symbol: '฿'
    });
    
    const usd = await FiatCurrency.create({
      code: 'USD',
      name: 'US Dollar',
      symbol: '$'
    });
    
    console.log('Fiat currencies created');
    
    // Create Users
    const user1 = await User.create({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123'
    });
    
    const user2 = await User.create({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123'
    });
    
    const user3 = await User.create({
      username: 'charlie',
      email: 'charlie@example.com',
      password: 'password123'
    });
    
    console.log('Users created');
    
  
    const cryptos = [btc, eth, xrp, doge];
    const users = [user1, user2, user3];
    
    for (const user of users) {
      for (const crypto of cryptos) {
        const wallet = await Wallet.create({
          wallet_address: generateWalletAddress(crypto.symbol),
          balance: Math.random() * 10, 
          user_id: user.user_id,
          crypto_id: crypto.crypto_id
        });
      }
    }
    
    console.log('Wallets created');
    

    await P2POffer.create({
      seller_id: user1.user_id,
      crypto_id: btc.crypto_id,
      fiat_id: thb.fiat_id,
      min_amount: 1000,
      max_amount: 50000,
      price_per_coin: 1200000,
      offer_type: 'sell'
    });
    
    await P2POffer.create({
      seller_id: user2.user_id,
      crypto_id: eth.crypto_id,
      fiat_id: thb.fiat_id,
      min_amount: 500,
      max_amount: 20000,
      price_per_coin: 80000,
      offer_type: 'sell'
    });
    
    await P2POffer.create({
      seller_id: user3.user_id,
      crypto_id: btc.crypto_id,
      fiat_id: usd.fiat_id,
      min_amount: 50,
      max_amount: 5000,
      price_per_coin: 35000,
      offer_type: 'buy'
    });
    
    console.log('P2P offers created');
    

    const order1 = await Order.create({
      user_id: user1.user_id,
      order_type: 'buy',
      crypto_id: btc.crypto_id,
      fiat_id: thb.fiat_id,
      amount: 0.01,
      price: 1200000,
      status: 'completed'
    });
    
    const order2 = await Order.create({
      user_id: user2.user_id,
      order_type: 'sell',
      crypto_id: eth.crypto_id,
      fiat_id: thb.fiat_id,
      amount: 0.5,
      price: 80000,
      status: 'pending'
    });
    
    console.log('Orders created');
    
    const wallet1 = await Wallet.findOne({
      where: { user_id: user1.user_id, crypto_id: btc.crypto_id }
    });
    
    const wallet2 = await Wallet.findOne({
      where: { user_id: user2.user_id, crypto_id: btc.crypto_id }
    });
    
    await Transaction.create({
      tx_type: 'transfer_internal',
      amount: 0.001,
      from_wallet_id: wallet1.wallet_id,
      to_wallet_id: wallet2.wallet_id,
      status: 'confirmed'
    });
    
    console.log('Transactions created');
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
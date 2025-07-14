const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Cryptocurrency = require('../models/Cryptocurrency');
const { generateWalletAddress } = require('../utils/crypto');

class UserController {
  // Register new user
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      
      // Create user
      const user = await User.create({ username, email, password });
      
      // Create wallets for each cryptocurrency
      const cryptos = await Cryptocurrency.findAll();
      for (const crypto of cryptos) {
        await Wallet.create({
          wallet_address: generateWalletAddress(crypto.symbol),
          user_id: user.user_id,
          crypto_id: crypto.crypto_id
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  // Login user
  async login(req, res) {
    try {
      const { username, password } = req.body;
      
      const user = await User.findOne({ where: { username } });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      // In real app, generate JWT token here
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  // Get user wallets
  async getWallets(req, res) {
    try {
      const { userId } = req.params;
      
      const wallets = await Wallet.findAll({
        where: { user_id: userId },
        include: [{ model: Cryptocurrency }]
      });
      
      res.json({ success: true, wallets });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new UserController();
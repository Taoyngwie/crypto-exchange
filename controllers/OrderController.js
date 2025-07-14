const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const sequelize = require('../config/database');

class OrderController {
  // Create buy/sell order
  async createOrder(req, res) {
    const t = await sequelize.transaction();
    
    try {
      const { user_id, order_type, crypto_id, fiat_id, amount, price } = req.body;
      
      // Create order
      const order = await Order.create({
        user_id,
        order_type,
        crypto_id,
        fiat_id,
        amount,
        price,
        status: 'pending'
      }, { transaction: t });
      
      // Find matching orders (simplified matching logic)
      const matchingOrders = await Order.findAll({
        where: {
          order_type: order_type === 'buy' ? 'sell' : 'buy',
          crypto_id,
          fiat_id,
          price: order_type === 'buy' ? { [sequelize.Op.lte]: price } : { [sequelize.Op.gte]: price },
          status: 'pending'
        },
        order: [['created_at', 'ASC']],
        transaction: t
      });
      
      // Execute trades
      let remainingAmount = parseFloat(amount);
      for (const matchOrder of matchingOrders) {
        if (remainingAmount <= 0) break;
        
        const tradeAmount = Math.min(remainingAmount, parseFloat(matchOrder.amount));
        
        // Update wallets
        const buyerWallet = await Wallet.findOne({
          where: {
            user_id: order_type === 'buy' ? user_id : matchOrder.user_id,
            crypto_id
          },
          transaction: t
        });
        
        const sellerWallet = await Wallet.findOne({
          where: {
            user_id: order_type === 'sell' ? user_id : matchOrder.user_id,
            crypto_id
          },
          transaction: t
        });
        
        // Update balances
        buyerWallet.balance = parseFloat(buyerWallet.balance) + tradeAmount;
        sellerWallet.balance = parseFloat(sellerWallet.balance) - tradeAmount;
        
        await buyerWallet.save({ transaction: t });
        await sellerWallet.save({ transaction: t });
        
        // Create transaction
        await Transaction.create({
          tx_type: 'trade',
          amount: tradeAmount,
          from_wallet_id: sellerWallet.wallet_id,
          to_wallet_id: buyerWallet.wallet_id,
          order_id: order.order_id,
          status: 'confirmed'
        }, { transaction: t });
        
        // Update match order
        matchOrder.amount = parseFloat(matchOrder.amount) - tradeAmount;
        if (matchOrder.amount <= 0) {
          matchOrder.status = 'completed';
        }
        await matchOrder.save({ transaction: t });
        
        remainingAmount -= tradeAmount;
      }
      
      // Update order status
      if (remainingAmount <= 0) {
        order.status = 'completed';
      } else {
        order.amount = remainingAmount;
      }
      await order.save({ transaction: t });
      
      await t.commit();
      
      res.json({
        success: true,
        order,
        message: remainingAmount <= 0 ? 'Order completed' : 'Order partially filled'
      });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  // Get user orders
  async getUserOrders(req, res) {
    try {
      const { userId } = req.params;
      
      const orders = await Order.findAll({
        where: { user_id: userId },
        include: [
          { model: Cryptocurrency },
          { model: FiatCurrency }
        ],
        order: [['created_at', 'DESC']]
      });
      
      res.json({ success: true, orders });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  // Cancel order
  async cancelOrder(req, res) {
    try {
      const { orderId } = req.params;
      
      const order = await Order.findByPk(orderId);
      if (!order || order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: 'Order cannot be cancelled'
        });
      }
      
      order.status = 'cancelled';
      await order.save();
      
      res.json({ success: true, message: 'Order cancelled successfully' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new OrderController();
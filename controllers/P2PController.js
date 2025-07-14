// controllers/P2PController.js
const P2POffer = require('../models/P2POffer');
const Order = require('../models/Order');
const User = require('../models/User');
const Cryptocurrency = require('../models/Cryptocurrency');
const FiatCurrency = require('../models/FiatCurrency');

class P2PController {
  // Create P2P offer
  async createOffer(req, res) {
    try {
      const { seller_id, crypto_id, fiat_id, min_amount, max_amount, price_per_coin, offer_type } = req.body;
      
      const offer = await P2POffer.create({
        seller_id,
        crypto_id,
        fiat_id,
        min_amount,
        max_amount,
        price_per_coin,
        offer_type
      });
      
      res.status(201).json({ success: true, offer });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  // Get active P2P offers
  async getActiveOffers(req, res) {
    try {
      const { crypto_id, fiat_id, offer_type } = req.query;
      
      const where = { status: 'active' };
      if (crypto_id) where.crypto_id = crypto_id;
      if (fiat_id) where.fiat_id = fiat_id;
      if (offer_type) where.offer_type = offer_type;
      
      const offers = await P2POffer.findAll({
        where,
        include: [
          { model: User, as: 'seller', attributes: ['username'] },
          { model: Cryptocurrency },
          { model: FiatCurrency }
        ],
        order: [['price_per_coin', offer_type === 'buy' ? 'DESC' : 'ASC']]
      });
      
      res.json({ success: true, offers });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  // Accept P2P offer (create order from offer)
  async acceptOffer(req, res) {
    try {
      const { offerId } = req.params;
      const { buyer_id, amount } = req.body;
      
      const offer = await P2POffer.findByPk(offerId);
      
      if (!offer || offer.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: 'Offer not available'
        });
      }
      
      if (amount < offer.min_amount || amount > offer.max_amount) {
        return res.status(400).json({
          success: false,
          error: 'Amount out of range'
        });
      }
      
      // Create order based on offer
      const order = await Order.create({
        user_id: buyer_id,
        order_type: offer.offer_type === 'sell' ? 'buy' : 'sell',
        crypto_id: offer.crypto_id,
        fiat_id: offer.fiat_id,
        amount: amount / offer.price_per_coin, // Convert to crypto amount
        price: offer.price_per_coin,
        status: 'pending'
      });
      
      res.json({
        success: true,
        order,
        message: 'Order created from P2P offer'
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new P2PController();

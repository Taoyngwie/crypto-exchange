const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const sequelize = require('../config/database');
const { generateTxHash } = require('../utils/crypto');

class TransactionController {
  // Internal transfer
  async transferInternal(req, res) {
    const t = await sequelize.transaction();
    
    try {
      const { from_wallet_id, to_wallet_address, amount } = req.body;
      
      // Get wallets
      const fromWallet = await Wallet.findByPk(from_wallet_id, { transaction: t });
      const toWallet = await Wallet.findOne({
        where: { wallet_address: to_wallet_address },
        transaction: t
      });
      
      if (!fromWallet || !toWallet) {
        throw new Error('Invalid wallet');
      }
      
      if (fromWallet.crypto_id !== toWallet.crypto_id) {
        throw new Error('Currency mismatch');
      }
      
      if (parseFloat(fromWallet.balance) < parseFloat(amount)) {
        throw new Error('Insufficient balance');
      }
      
      // Update balances
      fromWallet.balance = parseFloat(fromWallet.balance) - parseFloat(amount);
      toWallet.balance = parseFloat(toWallet.balance) + parseFloat(amount);
      
      await fromWallet.save({ transaction: t });
      await toWallet.save({ transaction: t });
      
      // Create transaction
      const transaction = await Transaction.create({
        tx_type: 'transfer_internal',
        amount,
        from_wallet_id,
        to_wallet_id: toWallet.wallet_id,
        status: 'confirmed'
      }, { transaction: t });
      
      await t.commit();
      
      res.json({ success: true, transaction });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  // External transfer
  async transferExternal(req, res) {
    const t = await sequelize.transaction();
    
    try {
      const { from_wallet_id, external_address, amount } = req.body;
      
      const fromWallet = await Wallet.findByPk(from_wallet_id, { transaction: t });
      
      if (!fromWallet) {
        throw new Error('Invalid wallet');
      }
      
      if (parseFloat(fromWallet.balance) < parseFloat(amount)) {
        throw new Error('Insufficient balance');
      }
      
      // Update balance
      fromWallet.balance = parseFloat(fromWallet.balance) - parseFloat(amount);
      await fromWallet.save({ transaction: t });
      
      // Create transaction
      const transaction = await Transaction.create({
        tx_type: 'transfer_external',
        amount,
        from_wallet_id,
        tx_hash: generateTxHash(),
        status: 'pending' 
      }, { transaction: t });
      
      await t.commit();
      
      res.json({
        success: true,
        transaction,
        external_address,
        message: 'External transfer initiated'
      });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  // Get wallet transactions
  async getWalletTransactions(req, res) {
    try {
      const { walletId } = req.params;
      
      const transactions = await Transaction.findAll({
        where: {
          [sequelize.Op.or]: [
            { from_wallet_id: walletId },
            { to_wallet_id: walletId }
          ]
        },
        include: [
          { model: Wallet, as: 'fromWallet' },
          { model: Wallet, as: 'toWallet' }
        ],
        order: [['created_at', 'DESC']]
      });
      
      res.json({ success: true, transactions });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new TransactionController();
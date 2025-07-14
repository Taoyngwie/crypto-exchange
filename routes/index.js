const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');
const OrderController = require('../controllers/OrderController');
const TransactionController = require('../controllers/TransactionController');
const P2PController = require('../controllers/P2PController');

// User routes
router.post('/users/register', UserController.register);
router.post('/users/login', UserController.login);
router.get('/users/:userId/wallets', UserController.getWallets);

// Order routes
router.post('/orders', OrderController.createOrder);
router.get('/users/:userId/orders', OrderController.getUserOrders);
router.put('/orders/:orderId/cancel', OrderController.cancelOrder);

// Transaction routes
router.post('/transactions/internal', TransactionController.transferInternal);
router.post('/transactions/external', TransactionController.transferExternal);
router.get('/wallets/:walletId/transactions', TransactionController.getWalletTransactions);

// P2P routes
router.post('/p2p/offers', P2PController.createOffer);
router.get('/p2p/offers', P2PController.getActiveOffers);
router.post('/p2p/offers/:offerId/accept', P2PController.acceptOffer);

module.exports = router;
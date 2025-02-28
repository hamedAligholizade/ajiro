/**
 * Transaction routes
 */
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { attachShopId, ensureShopAccess } = require('../middleware/shopMiddleware');

// Apply middleware to all routes
router.use(authenticateJWT);
router.use(attachShopId);
router.use(ensureShopAccess);

// Get all transactions
router.get('/', transactionController.getTransactions);

// Get a single transaction
router.get('/:id', transactionController.getTransactionById);

// Create a new transaction
router.post('/', transactionController.createTransaction);

module.exports = router; 
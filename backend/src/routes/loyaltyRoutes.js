const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authenticateJWT);

// Get loyalty config for a shop
router.get('/shops/:shopId/loyalty/config', loyaltyController.getLoyaltyConfig);

// Update loyalty config
router.put('/shops/:shopId/loyalty/config', loyaltyController.updateLoyaltyConfig);

// Calculate points for a transaction
router.post('/shops/:shopId/loyalty/calculate-points', loyaltyController.calculatePoints);

// Process points for a transaction
router.post('/shops/:shopId/transactions/:transactionId/process-points', loyaltyController.processTransactionPoints);

module.exports = router; 
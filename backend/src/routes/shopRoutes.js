/**
 * Shop routes
 */
const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Apply authentication middleware
router.use(authenticateJWT);

// Get shop by ID
router.get('/:id', shopController.getShopById);

module.exports = router; 
/**
 * Stats routes for analytics and dashboard data
 */
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { attachShopId, ensureShopAccess } = require('../middleware/shopMiddleware');

// Apply middleware to all routes
router.use(authenticateJWT);
router.use(attachShopId);
router.use(ensureShopAccess);

// Dashboard overview stats
router.get('/dashboard', statsController.getDashboardStats);

// Sales analytics
router.get('/sales', statsController.getSalesAnalytics);

// Inventory stats
router.get('/inventory', statsController.getInventoryStats);

module.exports = router; 
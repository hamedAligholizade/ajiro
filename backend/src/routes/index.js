const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const transactionRoutes = require('./transactionRoutes');
const customerRoutes = require('./customerRoutes');
const loyaltyRoutes = require('./loyaltyRoutes');

/**
 * @route   GET /
 * @desc    Test endpoint to verify server functionality
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({ message: "Ajiro server is running" });
});

/**
 * @route   GET /health
 * @desc    Health check endpoint for monitoring
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Apply routes
router.use('/api/auth', authRoutes);
router.use('/api/products', productRoutes);
router.use('/api/transactions', transactionRoutes);
router.use('/api/customers', customerRoutes);
router.use('/api/loyalty', loyaltyRoutes);

module.exports = router; 
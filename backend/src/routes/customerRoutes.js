const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authenticateJWT);

// Get all customers for a shop
router.get('/shops/:shopId/customers', customerController.getCustomers);

// Get customer by mobile number
router.get('/shops/:shopId/customers/mobile/:mobileNumber', customerController.getCustomerByMobile);

// Create new customer
router.post('/shops/:shopId/customers', customerController.createCustomer);

// Update customer
router.put('/shops/:shopId/customers/:customerId', customerController.updateCustomer);

// Get customer loyalty details
router.get('/shops/:shopId/customers/:customerId/loyalty', customerController.getCustomerLoyalty);

// Adjust points for a customer (manual)
router.post('/shops/:shopId/customers/:customerId/points', customerController.adjustPoints);

module.exports = router; 
/**
 * Product routes
 */
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { attachShopId, ensureShopAccess } = require('../middleware/shopMiddleware');

// Apply middleware to all routes
router.use(authenticateJWT);
router.use(attachShopId);
router.use(ensureShopAccess);

// Get all products
router.get('/', productController.getProducts);

// Get a single product
router.get('/:id', productController.getProductById);

// Create a new product
router.post('/', productController.createProduct);

// Update a product
router.put('/:id', productController.updateProduct);

// Delete a product
router.delete('/:id', productController.deleteProduct);

module.exports = router; 
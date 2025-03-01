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

// Create a new product with single or multiple image uploads
router.post('/', (req, res, next) => {
  productController.uploadProductImages(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
    next();
  });
}, productController.createProduct);

// Update a product with single or multiple image uploads
router.put('/:id', (req, res, next) => {
  productController.uploadProductImages(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
    next();
  });
}, productController.updateProduct);

// Delete a product
router.delete('/:id', productController.deleteProduct);

module.exports = router; 
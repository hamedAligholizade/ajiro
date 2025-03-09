/**
 * Authentication routes
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Register a new user
router.post('/signup', authController.signup);

// Login a user
router.post('/signin', authController.signin);

// Verify a code for mobile authentication
router.post('/verify', authController.verify);

// Resend a verification code
router.post('/resend-code', authController.resendCode);

// Get current authenticated user
router.get('/me', authenticateJWT, authController.getCurrentUser);

module.exports = router; 
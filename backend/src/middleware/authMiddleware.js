/**
 * Authentication middleware for protecting routes
 */
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticateJWT = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'احراز هویت الزامی است'
      });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'کاربر یافت نشد'
      });
    }
    
    // Check if user is verified
    if (!user.is_verified) {
      return res.status(403).json({
        status: 'error',
        message: 'حساب کاربری شما تایید نشده است'
      });
    }
    
    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    console.error('JWT Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'جلسه شما منقضی شده است. لطفا دوباره وارد شوید'
      });
    }
    
    return res.status(401).json({
      status: 'error',
      message: 'احراز هویت ناموفق بود'
    });
  }
};

/**
 * Generate JWT token for a user
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      shop_id: user.shop_id,
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

module.exports = {
  authenticateJWT,
  generateToken
}; 
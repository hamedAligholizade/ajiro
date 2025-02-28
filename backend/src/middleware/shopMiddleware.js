/**
 * Shop middleware for enforcing data isolation between different shops
 */

/**
 * Middleware to ensure users can only access their own shop's data
 * Must be used after authenticateJWT middleware
 */
const ensureShopAccess = (req, res, next) => {
  try {
    // Get shop_id from params or query or body
    const requestedShopId = req.params.shop_id || req.query.shop_id || req.body.shop_id;
    
    // If no specific shop is requested, proceed (user's shop_id will be used)
    if (!requestedShopId) {
      return next();
    }
    
    // Convert to number for comparison
    const shopIdNum = parseInt(requestedShopId, 10);
    
    // Check if user is trying to access a shop they don't belong to
    if (shopIdNum !== req.user.shop_id) {
      return res.status(403).json({
        status: 'error',
        message: 'شما مجوز دسترسی به این فروشگاه را ندارید'
      });
    }
    
    next();
  } catch (error) {
    console.error('Shop access error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در بررسی دسترسی به فروشگاه'
    });
  }
};

/**
 * Middleware to attach shop_id to query/params if not present
 * This helps filter queries to only return data for the user's shop
 * Must be used after authenticateJWT middleware
 */
const attachShopId = (req, res, next) => {
  // For GET requests, attach to query
  if (req.method === 'GET') {
    req.query.shop_id = req.query.shop_id || req.user.shop_id;
  }
  
  // For requests with body, attach to body if not performing shop-specific request
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.body.shop_id) {
    req.body.shop_id = req.user.shop_id;
  }
  
  next();
};

module.exports = {
  ensureShopAccess,
  attachShopId
}; 
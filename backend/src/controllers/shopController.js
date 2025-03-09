/**
 * Shop controller for shop management
 */
const { Shop } = require('../models');

/**
 * Get a shop by ID
 * @route GET /api/shops/:id
 */
const getShopById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const shop = await Shop.findByPk(id);
    
    if (!shop) {
      return res.status(404).json({
        status: 'error',
        message: 'فروشگاه یافت نشد'
      });
    }
    
    // Check if user has access to this shop
    if (req.user.shop_id !== shop.id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'شما مجوز دسترسی به این فروشگاه را ندارید'
      });
    }
    
    return res.status(200).json({
      id: shop.id,
      name: shop.name,
      address: shop.address,
      created_at: shop.created_at
    });
  } catch (error) {
    console.error('Get shop error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در دریافت اطلاعات فروشگاه'
    });
  }
};

module.exports = {
  getShopById
}; 
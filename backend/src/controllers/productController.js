/**
 * Product controller for managing products in the shop
 */
const { Product } = require('../models');
const { Sequelize, Op } = require('sequelize');

/**
 * Get all products for a shop
 * @route GET /api/products
 */
const getProducts = async (req, res) => {
  try {
    const { shop_id, search, page = 1, limit = 20 } = req.query;
    
    // Ensure shop_id is set (should be set by attachShopId middleware)
    if (!shop_id) {
      return res.status(400).json({
        status: 'error',
        message: 'شناسه فروشگاه الزامی است'
      });
    }
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build query conditions
    const whereConditions = {
      shop_id,
    };
    
    // Add search condition if provided
    if (search) {
      whereConditions.name = {
        [Op.iLike]: `%${search}%` // Case insensitive search
      };
    }
    
    // Query products
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      count,
      totalPages,
      currentPage: parseInt(page),
      products,
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در دریافت محصولات'
    });
  }
};

/**
 * Get a single product by ID
 * @route GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { shop_id } = req.query;
    
    // Ensure shop_id is set (should be set by attachShopId middleware)
    if (!shop_id) {
      return res.status(400).json({
        status: 'error',
        message: 'شناسه فروشگاه الزامی است'
      });
    }
    
    // Find product
    const product = await Product.findOne({
      where: {
        id,
        shop_id,
      }
    });
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'محصول یافت نشد'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      product,
    });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در دریافت محصول'
    });
  }
};

/**
 * Create a new product
 * @route POST /api/products
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock_quantity, shop_id } = req.body;
    
    // Validate required fields
    if (!name || !price) {
      return res.status(400).json({
        status: 'error',
        message: 'نام و قیمت محصول الزامی است'
      });
    }
    
    // Ensure shop_id is set (should be set by attachShopId middleware)
    if (!shop_id) {
      return res.status(400).json({
        status: 'error',
        message: 'شناسه فروشگاه الزامی است'
      });
    }
    
    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      stock_quantity: stock_quantity || 0,
      shop_id,
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'محصول با موفقیت ایجاد شد',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در ایجاد محصول'
    });
  }
};

/**
 * Update a product
 * @route PUT /api/products/:id
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock_quantity, shop_id } = req.body;
    
    // Ensure shop_id is set (should be set by attachShopId middleware)
    if (!shop_id) {
      return res.status(400).json({
        status: 'error',
        message: 'شناسه فروشگاه الزامی است'
      });
    }
    
    // Find product
    const product = await Product.findOne({
      where: {
        id,
        shop_id,
      }
    });
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'محصول یافت نشد'
      });
    }
    
    // Update product
    await product.update({
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      price: price || product.price,
      stock_quantity: stock_quantity !== undefined ? stock_quantity : product.stock_quantity,
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'محصول با موفقیت به روز رسانی شد',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در به روز رسانی محصول'
    });
  }
};

/**
 * Delete a product
 * @route DELETE /api/products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { shop_id } = req.query;
    
    // Ensure shop_id is set (should be set by attachShopId middleware)
    if (!shop_id) {
      return res.status(400).json({
        status: 'error',
        message: 'شناسه فروشگاه الزامی است'
      });
    }
    
    // Find product
    const product = await Product.findOne({
      where: {
        id,
        shop_id,
      }
    });
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'محصول یافت نشد'
      });
    }
    
    // Delete product
    await product.destroy();
    
    return res.status(200).json({
      status: 'success',
      message: 'محصول با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در حذف محصول'
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
}; 
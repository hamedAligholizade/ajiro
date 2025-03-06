/**
 * Product controller for managing products in the shop
 */
const { Product } = require('../models');
const { Sequelize, Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Get server base URL from environment or use default
const getBaseUrl = () => {
  return process.env.SERVER_URL || 'http://localhost:8000';
};

// Convert relative image paths to full URLs
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  
  const baseUrl = getBaseUrl();
  return `${baseUrl}/${imagePath}`;
};

// Process product data to include full image URLs
const processProductImages = (product) => {
  if (!product) return product;
  
  // Convert to plain object if it's a Sequelize model
  const productData = product.toJSON ? product.toJSON() : { ...product };
  
  // Process main image
  if (productData.image) {
    productData.image = getFullImageUrl(productData.image);
  }
  
  // Process additional images
  if (productData.images && Array.isArray(productData.images)) {
    productData.images = productData.images.map(img => getFullImageUrl(img));
  }
  
  return productData;
};

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/products');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// Filter for image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('فقط فایل های تصویری با فرمت JPEG، PNG یا GIF مجاز است'));
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size
  fileFilter: fileFilter
});

// Export upload middleware for routes
const uploadProductImage = upload.single('image');

// Export upload middleware for multiple images
const uploadProductImages = upload.fields([
  { name: 'image', maxCount: 1 },  // Main image
  { name: 'additionalImages', maxCount: 5 }  // Additional images, max 5
]);

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
    
    // Process products to add full URLs for images
    const processedProducts = products.map(product => processProductImages(product));
    
    return res.status(200).json({
      status: 'success',
      count,
      totalPages,
      currentPage: parseInt(page),
      products: processedProducts,
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
    
    // Process product to add full URLs for images
    const processedProduct = processProductImages(product);
    
    return res.status(200).json({
      status: 'success',
      product: processedProduct,
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
    
    // Handle main image upload
    let image = null;
    let images = [];
    
    if (req.files) {
      // Handle main image (single file)
      if (req.files.image && req.files.image.length > 0) {
        image = `uploads/products/${req.files.image[0].filename}`;
      }
      
      // Handle additional images (multiple files)
      if (req.files.additionalImages && req.files.additionalImages.length > 0) {
        images = req.files.additionalImages.map(file => `uploads/products/${file.filename}`);
      }
    } else if (req.file) {
      // For backward compatibility with single image upload
      image = `uploads/products/${req.file.filename}`;
    }
    
    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      stock_quantity: stock_quantity || 0,
      shop_id,
      image,
      images,
    });
    
    // Process product to add full URLs for images
    const processedProduct = processProductImages(product);
    
    return res.status(201).json({
      status: 'success',
      message: 'محصول با موفقیت ایجاد شد',
      product: processedProduct,
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
    const { name, description, price, stock_quantity, shop_id, removeImages } = req.body;
    
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
    
    // Handle main image upload
    let image = product.image;
    let existingImages = product.images || [];
    let imagesToRemove = [];
    
    // Parse removeImages if it's a string (from FormData)
    if (removeImages && typeof removeImages === 'string') {
      try {
        imagesToRemove = JSON.parse(removeImages);
      } catch (e) {
        console.error('Error parsing removeImages:', e);
        imagesToRemove = [];
      }
    } else if (Array.isArray(removeImages)) {
      imagesToRemove = removeImages;
    }
    
    if (req.files) {
      // Handle main image (single file)
      if (req.files.image && req.files.image.length > 0) {
        // Delete previous main image if it exists
        if (product.image) {
          const oldImagePath = path.join(__dirname, '../../', product.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        image = `uploads/products/${req.files.image[0].filename}`;
      }
      
      // Handle additional images (multiple files)
      if (req.files.additionalImages && req.files.additionalImages.length > 0) {
        const newImages = req.files.additionalImages.map(file => `uploads/products/${file.filename}`);
        existingImages = [...existingImages, ...newImages];
      }
    } else if (req.file) {
      // For backward compatibility with single image upload
      // Delete previous image if it exists
      if (product.image) {
        const oldImagePath = path.join(__dirname, '../../', product.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      image = `uploads/products/${req.file.filename}`;
    }
    
    // Remove images that were marked for removal
    if (imagesToRemove.length > 0) {
      // Delete files from disk
      for (const imgPath of imagesToRemove) {
        const fullPath = path.join(__dirname, '../../', imgPath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      
      // Remove from the list of images
      existingImages = existingImages.filter(img => !imagesToRemove.includes(img));
    }
    
    // Update product
    await product.update({
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      stock_quantity: stock_quantity !== undefined ? stock_quantity : product.stock_quantity,
      image,
      images: existingImages,
    });
    
    // Process updated product to add full URLs for images
    const processedProduct = processProductImages(product);
    
    return res.status(200).json({
      status: 'success',
      message: 'محصول با موفقیت بروزرسانی شد',
      product: processedProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در بروزرسانی محصول'
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
    
    // Delete product image if it exists
    if (product.image) {
      const imagePath = path.join(__dirname, '../../', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
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
  deleteProduct,
  uploadProductImage,
  uploadProductImages,
}; 
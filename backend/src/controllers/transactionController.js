/**
 * Transaction controller for managing sales transactions
 */
const { Transaction, TransactionItem, Product, sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;

/**
 * Get all transactions for a shop
 * @route GET /api/transactions
 */
const getTransactions = async (req, res) => {
  try {
    const { shop_id, page = 1, limit = 20, startDate, endDate } = req.query;
    
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
    
    // Add date range conditions if provided
    if (startDate && endDate) {
      whereConditions.transaction_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.transaction_date = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.transaction_date = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    // Query transactions with count
    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['transaction_date', 'DESC']],
      include: [
        {
          model: TransactionItem,
          as: 'TransactionItems',
        }
      ]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      count,
      totalPages,
      currentPage: parseInt(page),
      transactions,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در دریافت تراکنش ها'
    });
  }
};

/**
 * Get a single transaction by ID
 * @route GET /api/transactions/:id
 */
const getTransactionById = async (req, res) => {
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
    
    // Find transaction
    const transaction = await Transaction.findOne({
      where: {
        id,
        shop_id,
      },
      include: [
        {
          model: TransactionItem,
          as: 'TransactionItems',
          include: [
            {
              model: Product,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });
    
    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'تراکنش یافت نشد'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      transaction,
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در دریافت تراکنش'
    });
  }
};

/**
 * Create a new transaction (record a sale)
 * @route POST /api/transactions
 */
const createTransaction = async (req, res) => {
  // Use a transaction to ensure data consistency
  const t = await sequelize.transaction();
  
  try {
    const { items, total_amount, shop_id, notes } = req.body;
    
    // Validate required fields
    if (!items || !items.length) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'اقلام تراکنش الزامی است'
      });
    }
    
    // Ensure shop_id is set (should be set by attachShopId middleware)
    if (!shop_id) {
      await t.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'شناسه فروشگاه الزامی است'
      });
    }
    
    // Calculate total amount if not provided
    let calculatedTotal = 0;
    
    // Check product availability and calculate total
    for (const item of items) {
      const product = await Product.findOne({
        where: {
          id: item.product_id,
          shop_id,
        },
        transaction: t,
      });
      
      if (!product) {
        await t.rollback();
        return res.status(404).json({
          status: 'error',
          message: `محصول با شناسه ${item.product_id} یافت نشد`
        });
      }
      
      // Check stock availability
      if (product.stock_quantity < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          status: 'error',
          message: `موجودی محصول ${product.name} کافی نیست`
        });
      }
      
      // Update calculated total
      calculatedTotal += product.price * item.quantity;
      
      // Update product stock
      await product.update({
        stock_quantity: product.stock_quantity - item.quantity
      }, { transaction: t });
    }
    
    // Create transaction
    const transaction = await Transaction.create({
      total_amount: total_amount || calculatedTotal,
      transaction_date: new Date(),
      shop_id,
      notes,
    }, { transaction: t });
    
    // Create transaction items
    const transactionItems = [];
    
    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { transaction: t });
      
      const transactionItem = await TransactionItem.create({
        transaction_id: transaction.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_sale: product.price,
        subtotal: product.price * item.quantity,
      }, { transaction: t });
      
      transactionItems.push(transactionItem);
    }
    
    // Commit transaction
    await t.commit();
    
    return res.status(201).json({
      status: 'success',
      message: 'تراکنش با موفقیت ثبت شد',
      transaction: {
        ...transaction.toJSON(),
        TransactionItems: transactionItems,
      },
    });
  } catch (error) {
    // Rollback transaction in case of error
    await t.rollback();
    console.error('Create transaction error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در ثبت تراکنش'
    });
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction
}; 
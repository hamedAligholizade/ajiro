/**
 * Stats controller for analytics and dashboard
 */
const { Transaction, TransactionItem, Product, Customer, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Get dashboard overview stats
 * @route GET /api/stats/dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    const shopId = req.query.shop_id || req.user.shop_id;
    
    // Get date ranges
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    
    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1); // Start of month
    startOfMonth.setHours(0, 0, 0, 0);
    
    // Sales stats
    const dailySales = await Transaction.sum('total_amount', {
      where: {
        shop_id: shopId,
        transaction_date: {
          [Op.between]: [startOfToday, endOfToday]
        },
        status: 'completed'
      }
    }) || 0;
    
    const weeklySales = await Transaction.sum('total_amount', {
      where: {
        shop_id: shopId,
        transaction_date: {
          [Op.gte]: startOfWeek
        },
        status: 'completed'
      }
    }) || 0;
    
    const monthlySales = await Transaction.sum('total_amount', {
      where: {
        shop_id: shopId,
        transaction_date: {
          [Op.gte]: startOfMonth
        },
        status: 'completed'
      }
    }) || 0;
    
    // Count stats
    const totalProducts = await Product.count({
      where: {
        shop_id: shopId,
        isActive: true
      }
    });
    
    const totalCustomers = await Customer.count({
      where: {
        shop_id: shopId,
        isActive: true
      }
    });
    
    const transactionCount = await Transaction.count({
      where: {
        shop_id: shopId,
        status: 'completed'
      }
    });
    
    // Top selling products
    const topProducts = await TransactionItem.findAll({
      attributes: [
        'product_id',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('total_price')), 'total_sales']
      ],
      include: [{
        model: Transaction,
        where: {
          shop_id: shopId,
          status: 'completed',
          transaction_date: {
            [Op.gte]: startOfMonth
          }
        },
        attributes: []
      }, {
        model: Product,
        attributes: ['name']
      }],
      group: ['TransactionItem.product_id', 'Product.id'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: 5
    });

    // Recent transactions
    const recentTransactions = await Transaction.findAll({
      where: {
        shop_id: shopId
      },
      order: [['transaction_date', 'DESC']],
      limit: 5
    });

    return res.status(200).json({
      salesStats: {
        daily: dailySales,
        weekly: weeklySales,
        monthly: monthlySales
      },
      counts: {
        products: totalProducts,
        customers: totalCustomers,
        transactions: transactionCount
      },
      topProducts: topProducts.map(item => ({
        product_id: item.product_id,
        name: item.Product?.name || 'Unknown Product',
        quantity: parseInt(item.dataValues.total_quantity) || 0,
        sales: parseFloat(item.dataValues.total_sales) || 0
      })),
      recentTransactions
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در دریافت آمار داشبورد'
    });
  }
};

/**
 * Get sales analytics for a time period
 * @route GET /api/stats/sales
 */
const getSalesAnalytics = async (req, res) => {
  try {
    const shopId = req.query.shop_id || req.user.shop_id;
    const { period = 'month', start_date, end_date } = req.query;
    
    let startDate, endDate, groupByFormat;
    const today = new Date();
    endDate = end_date ? new Date(end_date) : new Date(today.setHours(23, 59, 59, 999));
    
    switch (period) {
      case 'week':
        startDate = start_date ? new Date(start_date) : new Date(today.setDate(today.getDate() - 7));
        groupByFormat = '%Y-%m-%d'; // Group by day
        break;
      case 'month':
        startDate = start_date ? new Date(start_date) : new Date(today.setDate(today.getDate() - 30));
        groupByFormat = '%Y-%m-%d'; // Group by day
        break;
      case 'quarter':
        startDate = start_date ? new Date(start_date) : new Date(today.setMonth(today.getMonth() - 3));
        groupByFormat = '%Y-%m'; // Group by month
        break;
      case 'year':
        startDate = start_date ? new Date(start_date) : new Date(today.setFullYear(today.getFullYear() - 1));
        groupByFormat = '%Y-%m'; // Group by month
        break;
      default:
        startDate = start_date ? new Date(start_date) : new Date(today.setDate(today.getDate() - 30));
        groupByFormat = '%Y-%m-%d'; // Group by day
    }
    
    const salesData = await Transaction.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('transaction_date'), groupByFormat), 'date'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        shop_id: shopId,
        status: 'completed',
        transaction_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('transaction_date'), groupByFormat)],
      order: [sequelize.fn('DATE_FORMAT', sequelize.col('transaction_date'), groupByFormat)]
    });
    
    return res.status(200).json({
      period,
      start_date: startDate,
      end_date: endDate,
      sales: salesData.map(item => ({
        date: item.dataValues.date,
        total: parseFloat(item.dataValues.total) || 0,
        count: parseInt(item.dataValues.count) || 0
      }))
    });
  } catch (error) {
    console.error('Sales analytics error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در دریافت آمار فروش'
    });
  }
};

/**
 * Get inventory status and analytics
 * @route GET /api/stats/inventory
 */
const getInventoryStats = async (req, res) => {
  try {
    const shopId = req.query.shop_id || req.user.shop_id;
    
    // Get low stock products
    const lowStockProducts = await Product.findAll({
      where: {
        shop_id: shopId,
        stock_quantity: {
          [Op.lte]: sequelize.col('low_stock_threshold')
        },
        isActive: true
      },
      order: [
        sequelize.literal('stock_quantity / NULLIF(low_stock_threshold, 0)'),
        ['updatedAt', 'DESC']
      ],
      limit: 10
    });
    
    // Get out of stock products
    const outOfStockCount = await Product.count({
      where: {
        shop_id: shopId,
        stock_quantity: 0,
        isActive: true
      }
    });
    
    // Get total inventory value
    const inventoryValue = await Product.sum(
      sequelize.literal('stock_quantity * price'),
      {
        where: {
          shop_id: shopId,
          isActive: true
        }
      }
    ) || 0;
    
    // Get inventory metrics by category
    const categoryMetrics = await Product.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'product_count'],
        [sequelize.fn('SUM', sequelize.col('stock_quantity')), 'total_stock'],
        [sequelize.literal('SUM(stock_quantity * price)'), 'inventory_value']
      ],
      where: {
        shop_id: shopId,
        isActive: true
      },
      group: ['category'],
      order: [[sequelize.literal('inventory_value'), 'DESC']]
    });
    
    return res.status(200).json({
      lowStockProducts,
      outOfStockCount,
      inventoryValue,
      categoryMetrics: categoryMetrics.map(item => ({
        category: item.category,
        product_count: parseInt(item.dataValues.product_count) || 0,
        total_stock: parseInt(item.dataValues.total_stock) || 0,
        inventory_value: parseFloat(item.dataValues.inventory_value) || 0
      }))
    });
  } catch (error) {
    console.error('Inventory stats error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطا در دریافت آمار موجودی'
    });
  }
};

module.exports = {
  getDashboardStats,
  getSalesAnalytics,
  getInventoryStats
}; 
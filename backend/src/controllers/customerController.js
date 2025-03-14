const { Customer, Shop, Transaction, PointTransaction } = require('../models');
const { Op } = require('sequelize');

// Get all customers for a specific shop
exports.getCustomers = async (req, res) => {
  try {
    const { shopId } = req.params;
    
    console.log('Getting customers for shop ID:', shopId);
    
    // Validate the shopId
    if (!shopId) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Shop ID is required' 
      });
    }
    
    const customers = await Customer.findAll({
      where: { shop_id: shopId, isActive: true },
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Found ${customers.length} customers for shop ${shopId}`);
    
    return res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch customers',
      details: error.message
    });
  }
};

// Get customer by mobile number
exports.getCustomerByMobile = async (req, res) => {
  try {
    const { shopId, mobileNumber } = req.params;
    
    console.log('Looking up customer:', { shopId, mobileNumber });
    
    // Validate inputs
    if (!shopId || !mobileNumber) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Shop ID and mobile number are required' 
      });
    }
    
    // Normalize mobile number (remove any spaces, dashes, etc.)
    const normalizedMobile = mobileNumber.replace(/\s+/g, '').replace(/-/g, '');
    
    const customer = await Customer.findOne({
      where: { 
        shop_id: shopId, 
        mobileNumber: normalizedMobile,
        isActive: true 
      },
      include: [
        {
          model: Transaction,
          limit: 5,
          order: [['createdAt', 'DESC']]
        },
        {
          model: PointTransaction,
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });
    
    if (!customer) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Customer not found' 
      });
    }
    
    return res.status(200).json(customer);
  } catch (error) {
    console.error('Error fetching customer by mobile:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch customer',
      details: error.message
    });
  }
};

// Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const { shopId } = req.params;
    const {
      firstName,
      lastName,
      mobileNumber,
      email,
      birthDate,
      notes
    } = req.body;
    
    console.log('Creating customer:', { shopId, mobileNumber, firstName, lastName });
    
    // Validate required fields
    if (!mobileNumber || !firstName) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Mobile number and first name are required'
      });
    }
    
    // Normalize mobile number
    const normalizedMobile = mobileNumber.replace(/\s+/g, '').replace(/-/g, '');
    
    // Check if shop exists
    try {
      const shop = await Shop.findByPk(shopId);
      if (!shop) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Shop not found' 
        });
      }
    } catch (shopError) {
      console.error('Error finding shop:', shopError);
      return res.status(500).json({ 
        status: 'error',
        message: 'Error validating shop',
        details: shopError.message
      });
    }
    
    // Check if customer with this mobile already exists
    try {
      const existingCustomer = await Customer.findOne({
        where: { 
          shop_id: shopId, 
          mobileNumber: normalizedMobile
        }
      });
      
      if (existingCustomer) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Customer with this mobile number already exists',
          customer: existingCustomer
        });
      }
    } catch (lookupError) {
      console.error('Error checking for existing customer:', lookupError);
      return res.status(500).json({ 
        status: 'error',
        message: 'Error checking for existing customer',
        details: lookupError.message
      });
    }
    
    // Create new customer
    try {
      const newCustomer = await Customer.create({
        firstName,
        lastName,
        mobileNumber: normalizedMobile,
        email,
        birthDate,
        notes,
        shop_id: shopId,
        availablePoints: 0,
        lifetimePoints: 0,
        tier: 'standard',
        isActive: true
      });
      
      console.log('Customer created successfully:', newCustomer.id);
      
      return res.status(201).json(newCustomer);
    } catch (createError) {
      console.error('Error creating customer:', createError);
      return res.status(500).json({ 
        status: 'error',
        message: 'Failed to create customer',
        details: createError.message
      });
    }
  } catch (error) {
    console.error('Customer creation error:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'An unexpected error occurred',
      details: error.message
    });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const { shopId, customerId } = req.params;
    const {
      firstName,
      lastName,
      mobileNumber,
      email,
      birthDate,
      notes,
      isActive
    } = req.body;
    
    const customer = await Customer.findOne({
      where: { 
        id: customerId,
        shop_id: shopId
      }
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // If mobile number is being changed, check if it's unique
    if (mobileNumber && mobileNumber !== customer.mobileNumber) {
      const existingCustomer = await Customer.findOne({
        where: { 
          shop_id: shopId, 
          mobileNumber,
          id: { [Op.ne]: customerId }  // not equal to the current customer
        }
      });
      
      if (existingCustomer) {
        return res.status(400).json({ error: 'Mobile number already in use by another customer' });
      }
    }
    
    // Update customer
    await customer.update({
      firstName: firstName || customer.firstName,
      lastName: lastName || customer.lastName,
      mobileNumber: mobileNumber || customer.mobileNumber,
      email: email !== undefined ? email : customer.email,
      birthDate: birthDate || customer.birthDate,
      notes: notes !== undefined ? notes : customer.notes,
      isActive: isActive !== undefined ? isActive : customer.isActive
    });
    
    return res.status(200).json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return res.status(500).json({ error: 'Failed to update customer' });
  }
};

// Get customer loyalty details
exports.getCustomerLoyalty = async (req, res) => {
  try {
    const { shopId, customerId } = req.params;
    
    const customer = await Customer.findOne({
      where: { 
        id: customerId,
        shop_id: shopId,
        isActive: true
      }
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Get point transactions
    const pointTransactions = await PointTransaction.findAll({
      where: { 
        customer_id: customerId,
        shop_id: shopId
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    // Get loyalty stats
    const loyaltyStats = {
      totalPointsEarned: customer.totalPoints,
      availablePoints: customer.availablePoints,
      tier: customer.tier,
      totalSpent: customer.totalSpent,
      pointTransactions
    };
    
    return res.status(200).json(loyaltyStats);
  } catch (error) {
    console.error('Error fetching customer loyalty:', error);
    return res.status(500).json({ error: 'Failed to fetch loyalty details' });
  }
};

// Manual point adjustment (for admin use)
exports.adjustPoints = async (req, res) => {
  try {
    const { shopId, customerId } = req.params;
    const { points, description } = req.body;
    
    if (!points || typeof points !== 'number') {
      return res.status(400).json({ error: 'Valid points value is required' });
    }
    
    const customer = await Customer.findOne({
      where: { 
        id: customerId,
        shop_id: shopId,
        isActive: true
      }
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Create point transaction
    const pointTransaction = await PointTransaction.create({
      customer_id: customerId,
      shop_id: shopId,
      points,
      type: 'adjustment',
      description: description || 'Manual adjustment',
    });
    
    // Update customer points
    await customer.update({
      totalPoints: customer.totalPoints + points,
      availablePoints: customer.availablePoints + points
    });
    
    return res.status(200).json({ 
      message: 'Points adjusted successfully',
      pointTransaction,
      updatedPoints: customer.availablePoints
    });
  } catch (error) {
    console.error('Error adjusting points:', error);
    return res.status(500).json({ error: 'Failed to adjust points' });
  }
}; 
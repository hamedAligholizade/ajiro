const { LoyaltyConfig, Shop, Customer, PointTransaction, Transaction } = require('../models');

// Get loyalty configuration for a shop
exports.getLoyaltyConfig = async (req, res) => {
  try {
    const { shopId } = req.params;
    
    // Check if shop exists
    const shop = await Shop.findByPk(shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    
    // Get or create loyalty config
    let loyaltyConfig = await LoyaltyConfig.findOne({
      where: { shop_id: shopId }
    });
    
    if (!loyaltyConfig) {
      // Create default config if doesn't exist
      loyaltyConfig = await LoyaltyConfig.create({
        shop_id: shopId,
        // All default values will be set by the model
      });
    }
    
    return res.status(200).json(loyaltyConfig);
  } catch (error) {
    console.error('Error fetching loyalty config:', error);
    return res.status(500).json({ error: 'Failed to fetch loyalty configuration' });
  }
};

// Update loyalty configuration
exports.updateLoyaltyConfig = async (req, res) => {
  try {
    const { shopId } = req.params;
    const {
      isEnabled,
      pointsPerUnit,
      redemptionValue,
      pointsExpiryDays,
      tierThresholds,
      tierMultipliers,
      specialRules
    } = req.body;
    
    // Get or create loyalty config
    let loyaltyConfig = await LoyaltyConfig.findOne({
      where: { shop_id: shopId }
    });
    
    if (!loyaltyConfig) {
      loyaltyConfig = await LoyaltyConfig.create({
        shop_id: shopId,
        // Default values will be set by model
      });
    }
    
    // Update config
    await loyaltyConfig.update({
      isEnabled: isEnabled !== undefined ? isEnabled : loyaltyConfig.isEnabled,
      pointsPerUnit: pointsPerUnit || loyaltyConfig.pointsPerUnit,
      redemptionValue: redemptionValue || loyaltyConfig.redemptionValue,
      pointsExpiryDays: pointsExpiryDays !== undefined ? pointsExpiryDays : loyaltyConfig.pointsExpiryDays,
      tierThresholds: tierThresholds || loyaltyConfig.tierThresholds,
      tierMultipliers: tierMultipliers || loyaltyConfig.tierMultipliers,
      specialRules: specialRules || loyaltyConfig.specialRules
    });
    
    return res.status(200).json(loyaltyConfig);
  } catch (error) {
    console.error('Error updating loyalty config:', error);
    return res.status(500).json({ error: 'Failed to update loyalty configuration' });
  }
};

// Calculate points for a transaction
exports.calculatePoints = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { total_amount, customer_id } = req.body;
    
    if (!total_amount || typeof total_amount !== 'number') {
      return res.status(400).json({ error: 'Valid total amount is required' });
    }
    
    // If no customer_id, no points can be earned
    if (!customer_id) {
      return res.status(200).json({ 
        points: 0,
        message: 'No customer selected, no points will be earned'
      });
    }
    
    // Get loyalty config
    const loyaltyConfig = await LoyaltyConfig.findOne({
      where: { shop_id: shopId }
    });
    
    if (!loyaltyConfig || !loyaltyConfig.isEnabled) {
      return res.status(200).json({
        points: 0,
        message: 'Loyalty program is not enabled for this shop'
      });
    }
    
    // Get customer info for tier
    const customer = await Customer.findOne({
      where: { id: customer_id, shop_id: shopId, isActive: true }
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Calculate base points (for each 1000 tomans, award pointsPerUnit points)
    const basePoints = Math.floor((total_amount / 1000) * loyaltyConfig.pointsPerUnit);
    
    // Apply tier multiplier
    const tierMultiplier = loyaltyConfig.tierMultipliers[customer.tier] || 1;
    const totalPoints = Math.floor(basePoints * tierMultiplier);
    
    return res.status(200).json({
      points: totalPoints,
      pointsPerUnit: loyaltyConfig.pointsPerUnit,
      tier: customer.tier,
      tierMultiplier,
      calculationBreakdown: {
        basePoints,
        tierMultiplied: totalPoints
      }
    });
  } catch (error) {
    console.error('Error calculating points:', error);
    return res.status(500).json({ error: 'Failed to calculate points' });
  }
};

// Process points for a completed transaction
exports.processTransactionPoints = async (req, res) => {
  try {
    const { shopId, transactionId } = req.params;
    const { points_to_redeem } = req.body;
    
    // Get the transaction
    const transaction = await Transaction.findOne({
      where: { id: transactionId, shop_id: shopId }
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // If no customer, nothing to do
    if (!transaction.customer_id) {
      return res.status(400).json({ 
        error: 'No customer associated with this transaction',
        transaction
      });
    }
    
    // Get the customer
    const customer = await Customer.findOne({
      where: { id: transaction.customer_id, shop_id: shopId }
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Get loyalty config
    const loyaltyConfig = await LoyaltyConfig.findOne({
      where: { shop_id: shopId }
    });
    
    if (!loyaltyConfig || !loyaltyConfig.isEnabled) {
      return res.status(200).json({
        message: 'Loyalty program is not enabled',
        transaction
      });
    }
    
    // REDEEM POINTS if requested
    if (points_to_redeem > 0) {
      // Check if customer has enough points
      if (customer.availablePoints < points_to_redeem) {
        return res.status(400).json({ 
          error: 'Customer does not have enough points to redeem',
          availablePoints: customer.availablePoints
        });
      }
      
      // Calculate redemption value in toman
      const redemptionAmount = (points_to_redeem * loyaltyConfig.redemptionValue);
      
      // Create point redemption transaction
      await PointTransaction.create({
        customer_id: customer.id,
        shop_id: shopId,
        transaction_id: transaction.id,
        points: -points_to_redeem,
        type: 'redeemed',
        description: `Redeemed ${points_to_redeem} points for ${redemptionAmount} tomans discount`,
      });
      
      // Update customer points
      await customer.update({
        availablePoints: customer.availablePoints - points_to_redeem
      });
      
      // Update transaction record
      await transaction.update({
        points_redeemed: points_to_redeem
      });
    }
    
    // AWARD POINTS for the purchase
    // Calculate points to earn
    const basePoints = Math.floor((transaction.total_amount / 1000) * loyaltyConfig.pointsPerUnit);
    const tierMultiplier = loyaltyConfig.tierMultipliers[customer.tier] || 1;
    const pointsEarned = Math.floor(basePoints * tierMultiplier);
    
    // If points expiry is enabled, calculate expiry date
    let expiryDate = null;
    if (loyaltyConfig.pointsExpiryDays) {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + loyaltyConfig.pointsExpiryDays);
    }
    
    // Create points earning transaction
    await PointTransaction.create({
      customer_id: customer.id,
      shop_id: shopId,
      transaction_id: transaction.id,
      points: pointsEarned,
      type: 'earned',
      description: `Earned ${pointsEarned} points from purchase of ${transaction.total_amount} tomans`,
      expiryDate
    });
    
    // Update customer data
    await customer.update({
      totalPoints: customer.totalPoints + pointsEarned,
      availablePoints: customer.availablePoints + pointsEarned,
      totalSpent: parseFloat(customer.totalSpent) + parseFloat(transaction.total_amount)
    });
    
    // Update transaction with points earned
    await transaction.update({
      points_earned: pointsEarned
    });
    
    // Check if customer should be upgraded to a new tier
    const currentTier = customer.tier;
    let newTier = currentTier;
    
    // Check tier thresholds
    const tiers = ['bronze', 'silver', 'gold', 'platinum'];
    for (let i = tiers.length - 1; i >= 0; i--) {
      const tierName = tiers[i];
      if (customer.totalPoints >= loyaltyConfig.tierThresholds[tierName]) {
        newTier = tierName;
        break;
      }
    }
    
    // If tier changed, update customer
    if (newTier !== currentTier) {
      await customer.update({ tier: newTier });
    }
    
    return res.status(200).json({
      message: 'Transaction points processed successfully',
      pointsEarned,
      pointsRedeemed: points_to_redeem || 0,
      currentPoints: customer.availablePoints,
      newTier: customer.tier,
      tierChanged: newTier !== currentTier
    });
    
  } catch (error) {
    console.error('Error processing transaction points:', error);
    return res.status(500).json({ error: 'Failed to process transaction points' });
  }
}; 
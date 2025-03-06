/**
 * LoyaltyConfig model for storing loyalty program settings
 */
module.exports = (sequelize, DataTypes) => {
  const LoyaltyConfig = sequelize.define('LoyaltyConfig', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    shop_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // Each shop has one config
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    // Points earned per 1000 tomans spent
    pointsPerUnit: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    // Amount in tomans for 1 point redemption
    redemptionValue: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      allowNull: false,
    },
    // Points expiry in days (null means never expire)
    pointsExpiryDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Tier thresholds in points
    tierThresholds: {
      type: DataTypes.JSONB,
      defaultValue: {
        bronze: 0,
        silver: 1000,
        gold: 5000,
        platinum: 20000
      },
      allowNull: false,
    },
    // Tier multipliers for points
    tierMultipliers: {
      type: DataTypes.JSONB,
      defaultValue: {
        bronze: 1,
        silver: 1.1,
        gold: 1.2,
        platinum: 1.5
      },
      allowNull: false,
    },
    // Special rules like birthdate bonus
    specialRules: {
      type: DataTypes.JSONB,
      defaultValue: {
        birthdayBonus: 500,
        welcomeBonus: 200,
        referralBonus: 300
      },
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {
    tableName: 'loyalty_configs',
    timestamps: true,
  });

  // Define associations
  LoyaltyConfig.associate = (models) => {
    LoyaltyConfig.belongsTo(models.Shop, { foreignKey: 'shop_id' });
  };

  return LoyaltyConfig;
}; 
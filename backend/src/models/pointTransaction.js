/**
 * PointTransaction model for tracking customer loyalty points
 */
module.exports = (sequelize, DataTypes) => {
  const PointTransaction = sequelize.define('PointTransaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    shop_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Can be null for manual adjustments
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // Can be positive (earned) or negative (redeemed)
    },
    type: {
      type: DataTypes.ENUM('earned', 'redeemed', 'expired', 'adjustment'),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true, // Only for earned points
    },
    isExpired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'point_transactions',
    timestamps: true,
  });

  // Define associations
  PointTransaction.associate = (models) => {
    PointTransaction.belongsTo(models.Customer, { foreignKey: 'customer_id' });
    PointTransaction.belongsTo(models.Shop, { foreignKey: 'shop_id' });
    PointTransaction.belongsTo(models.Transaction, { foreignKey: 'transaction_id' });
  };

  return PointTransaction;
}; 
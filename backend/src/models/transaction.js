/**
 * Transaction model for recording sales
 */
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      }
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    shop_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('completed', 'cancelled', 'refunded'),
      defaultValue: 'completed',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'transactions',
    timestamps: true,
  });

  // Define associations
  Transaction.associate = (models) => {
    Transaction.belongsTo(models.Shop, { foreignKey: 'shop_id' });
    Transaction.hasMany(models.TransactionItem, { 
      foreignKey: 'transaction_id',
      onDelete: 'CASCADE'
    });
  };

  return Transaction;
}; 
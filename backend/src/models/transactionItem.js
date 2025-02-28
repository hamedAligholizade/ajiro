/**
 * TransactionItem model for recording individual items in a transaction
 */
module.exports = (sequelize, DataTypes) => {
  const TransactionItem = sequelize.define('TransactionItem', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      }
    },
    price_at_sale: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      }
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
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
    tableName: 'transaction_items',
    timestamps: true,
    hooks: {
      beforeValidate: (item) => {
        // Calculate subtotal
        if (item.quantity && item.price_at_sale) {
          item.subtotal = parseFloat(item.price_at_sale) * item.quantity;
        }
      }
    }
  });

  // Define associations
  TransactionItem.associate = (models) => {
    TransactionItem.belongsTo(models.Transaction, { foreignKey: 'transaction_id' });
    TransactionItem.belongsTo(models.Product, { foreignKey: 'product_id' });
  };

  return TransactionItem;
}; 
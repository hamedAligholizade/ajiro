/**
 * Product model for inventory management
 */
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      }
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      }
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,  // Store an array of image paths
      allowNull: true,
      defaultValue: [],
      get() {
        const value = this.getDataValue('images');
        return value ? (typeof value === 'string' ? JSON.parse(value) : value) : [];
      },
      set(value) {
        this.setDataValue('images', typeof value === 'string' ? value : JSON.stringify(value));
      }
    },
    shop_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'products',
    timestamps: true,
  });

  // Define associations
  Product.associate = (models) => {
    Product.belongsTo(models.Shop, { foreignKey: 'shop_id' });
    Product.hasMany(models.TransactionItem, { foreignKey: 'product_id' });
  };

  return Product;
}; 
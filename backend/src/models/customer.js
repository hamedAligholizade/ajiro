/**
 * Customer model for loyalty club
 */
module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        // Persian mobile number format
        is: /^(0|98|\+98)9(0[1-5]|[1 3]\d|2[0-2]|98)\d{7}$/
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      }
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    totalPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    availablePoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    tier: {
      type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'),
      defaultValue: 'bronze',
      allowNull: false,
    },
    totalSpent: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    shop_id: {
      type: DataTypes.UUID,
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
    tableName: 'customers',
    timestamps: true,
  });

  // Define associations
  Customer.associate = (models) => {
    Customer.belongsTo(models.Shop, { foreignKey: 'shop_id' });
    Customer.hasMany(models.Transaction, { foreignKey: 'customer_id' });
    Customer.hasMany(models.PointTransaction, { foreignKey: 'customer_id' });
  };

  return Customer;
}; 
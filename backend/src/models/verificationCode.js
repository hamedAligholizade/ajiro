/**
 * VerificationCode model for handling SMS and email verification codes
 */
module.exports = (sequelize, DataTypes) => {
  const VerificationCode = sequelize.define('VerificationCode', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('email', 'mobile'),
      allowNull: false,
    },
    is_used: {
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
    tableName: 'verification_codes',
    timestamps: true,
  });

  // Define associations
  VerificationCode.associate = (models) => {
    VerificationCode.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  // Static method to generate a random 6-digit code
  VerificationCode.generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Instance method to check if the code is valid
  VerificationCode.prototype.isValid = function() {
    return new Date() < this.expires_at && !this.is_used;
  };

  return VerificationCode;
}; 
/**
 * Tenant model for multi-tenancy support
 * Each tenant represents a distinct shop using the Ajiro platform
 */
module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define('Tenant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      }
    },
    schemaName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending'),
      defaultValue: 'pending',
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      }
    },
    contactPhone: {
      type: DataTypes.STRING,
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
    tableName: 'tenants',
    timestamps: true,
  });

  // Hook to create schema when a new tenant is created
  Tenant.beforeCreate(async (tenant) => {
    tenant.schemaName = `tenant_${tenant.id.replace(/-/g, '')}`;
    
    // Create schema for this tenant
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${tenant.schemaName}"`);
  });

  return Tenant;
}; 
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database')[env];

console.log(`Initializing database connection for environment: ${env}`);

// Initialize Sequelize with config
let sequelize;
try {
  if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
    console.log(`Connected to database using ${config.use_env_variable}`);
  } else {
    // Get config from environment or fall back to config file
    const dbName = process.env.DB_NAME || config.database;
    const dbUser = process.env.DB_USER || config.username;
    const dbPassword = process.env.DB_PASSWORD || config.password;
    const dbHost = process.env.DB_HOST || config.host;
    const dbPort = process.env.DB_PORT || config.port;
    
    console.log(`Connecting to database at ${dbHost}:${dbPort}/${dbName}`);
    
    sequelize = new Sequelize(
      dbName,
      dbUser,
      dbPassword,
      {
        host: dbHost,
        port: dbPort,
        dialect: 'postgres',
        logging: env === 'development' ? console.log : false,
        define: {
          timestamps: true,
          underscored: true,
        },
        // Add connection pool configuration
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        // Add retry logic for connection failures
        retry: {
          max: 3
        }
      }
    );
  }
  
  // Test connection
  sequelize.authenticate()
    .then(() => {
      console.log('Database connection has been established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
} catch (error) {
  console.error('Error initializing database connection:', error);
}

// Models object to store all models
const db = {};

// Load all models
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    try {
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
      console.log(`Loaded model: ${model.name}`);
    } catch (error) {
      console.error(`Error loading model from file ${file}:`, error);
    }
  });

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    try {
      db[modelName].associate(db);
      console.log(`Set up associations for model: ${modelName}`);
    } catch (error) {
      console.error(`Error setting up associations for model ${modelName}:`, error);
    }
  }
});

// Add sequelize instance and Sequelize class to db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db; 
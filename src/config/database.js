// src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();
const serverConfig = require('./serverConfig');
const logger = require('../utils/logger');

// START: Temporary Debug Logs
console.log("--- DB CONFIG DEBUG ---");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "******" : "(empty)");
console.log("-----------------------");
// END: Temporary Debug Logs

const sequelize = new Sequelize(
  process.env.DB_NAME || 'Flights',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),     // Beautiful logs instead of console.log spam
    dialectOptions: {
      // Remove this in production if you don't want timezone issues
      timezone: '+05:30' // India time
    },
    timezone: '+05:30',
    define: {
      underscored: true,       
      // freezeTableName: true    // Prevents Sequelize from pluralizing table names
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logQueryParameters: serverConfig.NODE_ENV === 'development',
    benchmark: serverConfig.NODE_ENV === 'development'
  }
);

// Test the connection gracefully
sequelize
  .authenticate()
  .then(() => {
    logger.info('✅ MySQL Database connected successfully');
  })
  .catch((err) => {
    // USE CONSOLE.ERROR TO SEE THE LOG IMMEDIATELY
    console.error('❌ DB CONNECTION FAILED:', err);
    
    // logger.error might be too slow before exit
    logger.error('❌ Unable to connect to the database:', {
      message: err.message,
      stack: err.stack
    });
    
    // COMMENT THIS OUT TEMPORARILY TO KEEP THE PROCESS ALIVE
    // process.exit(1); 
});

module.exports = sequelize;
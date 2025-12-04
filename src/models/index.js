'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
// IMPORT CRITICAL FIX: Load config.js (not .json)
const config = require(__dirname + '/../config/config.js')[env]; 
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// 1. Read all files in this directory
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&      // Ignore hidden files
      file !== basename &&            // Ignore index.js
      file.slice(-3) === '.js' &&     // Only .js files
      file.indexOf('.test.js') === -1 // Ignore tests
    );
  })
  .forEach(file => {
    // 2. Import the model
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    // 3. Add it to our db object
    db[model.name] = model;
  });

// 4. Run associations (Relations)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
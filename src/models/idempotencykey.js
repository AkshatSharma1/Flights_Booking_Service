'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class IdempotencyKey extends Model {
    static associate(models) {
      // define association here
    }
  }
  IdempotencyKey.init(
    {
      key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      response: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "IdempotencyKey",
      tableName: "idempotencykeys",
      underscored: true,
    }
  );
  return IdempotencyKey;
};
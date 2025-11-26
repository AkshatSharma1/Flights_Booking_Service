const { where } = require("sequelize");
const logger = require("../utils/logger");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");

class CrudRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    try {
      const response = await this.model.create(data);
      return response;
    } catch (error) {
        logger.error("Something went wrong in the crud repo: create", {
          error: error.message,
          stack: error.stack
        });
      throw error;
    }
  }

  //delete
  async destroy(data) {
    try {
      const response = await this.model.destroy({
        where: {
          id: data,
        },
      });

      if(!response){
        throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND)
      }

      return response;
    } catch (error) {
        logger.error("Something went wrong in the crud repo: destroy", {
          error: error.message,
          stack: error.stack
        });
      throw error;
    }
  }

  //get one
  async get(data) {
    try {
      const response = await this.model.findByPk(data);
      return response;
    } catch (error) {
        logger.error("Something went wrong in the crud repo: get", {
          error: error.message,
          stack: error.stack
        });
      throw error;
    }
  }

  //get all
  async getAll(data) {
    try {
      const response = await this.model.findAll();
      if(!response){
        throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND)
      }
      return response;
    } catch (error) {
        logger.error("Something went wrong in the crud repo: getAll", {
          error: error.message,
          stack: error.stack
        });
      throw error;
    }
  }

  //update
  async update(id, data) { //data- > {col: value,....}
    try {
      const response = await this.model.update(data,{
        where:{
            id: id
        }
      });

      if(!response){
        throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND)
      }
      return response;
    } catch (error) {
        logger.error("Something went wrong in the crud repo: update", {
          error: error.message,
          stack: error.stack
        });
      throw error;
    }
  }
}

module.exports = CrudRepository
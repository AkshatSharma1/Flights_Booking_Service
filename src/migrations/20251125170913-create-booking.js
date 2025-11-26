'use strict';
/** @type {import('sequelize-cli').Migration} */

const {Enums} = require('../utils/common');
const {BOOKED, CANCELLED, INITIATED, PENDING} = Enums.BOOKING_STATUS

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      flight_id: {
        type: Sequelize.INTEGER,
        allowNull: false
        // NO REFERENCE HERE (Microservice Architecture)
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM,
        values: [BOOKED, CANCELLED, INITIATED, PENDING],
        defaultValue: INITIATED,
        allowNull: false
      },
      no_of_seats: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      total_cost: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bookings');
  }
};
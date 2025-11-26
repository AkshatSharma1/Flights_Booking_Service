// src/config/serverConfig.js
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FLIGHT_SERVICE_PATH: process.env.FLIGHT_SERVICE_PATH || 'http://localhost:3000',

  JWT_SECRET: process.env.JWT_SECRET || 'my-super-secret-jwt-key-2025',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Booking expiry (for seat hold logic)
//   BOOKING_EXPIRY_MINUTES: Number(process.env.BOOKING_EXPIRY_MINUTES) || 15,
};
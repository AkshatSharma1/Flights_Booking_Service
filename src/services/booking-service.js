const db = require("../models");
const { BookingRepository } = require("../repositories");

const bookingRepository = new BookingRepository();
const config = require("../config/serverConfig");
const axios = require("axios");
const { Enums } = require("../utils/common");
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;
const { ErrorResponse } = require("../utils/common");
const AppError = require("../utils/errors/app-error");

//Create Booking
async function createBooking(data) {
  //Start Transaction of Booking DB
  const transaction = await db.sequelize.transaction();

  try {
    //Microservice call to flight-data-service
    const flightId = data.flightId;
    const getFlightRequestURL = `${config.FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;

    const response = await axios.get(getFlightRequestURL);
    const flightData = response.data.data;

    //seat checks
    if (data.noOfSeats > flightData.totalSeats) {
      throw new AppError("Not enough seats available", StatusCodes.BAD_REQUEST);
    }

    const totalBillingAmount = data.noOfSeats * flightData.price;
    const bookingPayload = { ...data, totalCost: totalBillingAmount };

    // Step 2: Create Booking (INITIATED) locally
    const booking = await bookingRepository.createBooking(
      bookingPayload,
      transaction
    );

    // Step 3: Call Flight Service to Update Seats (Pessimistic Lock happens here remotely)
    const updateFlightRequestURL = `${config.FLIGHT_SERVICE_PATH}/api/v1/flights/${booking.flightId}/seats`;
    console.log("FlightSearchURL", updateFlightRequestURL);

    await axios.patch(updateFlightRequestURL, {
      seats: data.noOfSeats,
      dec: true,
    });

    // Step 4: If successful, update Booking to BOOKED
    await bookingRepository.update(booking.id, { status: BOOKED }, transaction);

    // Step 5: Commit Local Transaction
    await transaction.commit();
    return booking;
  } catch (error) {
    //rollback
    await transaction.rollback();
    throw error;
  }
}

//Cancel booked seats
//Flow: Given a bookingId, check if booking there ->yes->Validate already cancelled?->No->call flight-data-service->increment seats->Update status here to Cancelled

async function cancelBooking(bookingId) {
  //start a transaction
  const transaction = await db.sequelize.transaction();

  try {
    //get flight booking details
    const booking = await bookingRepository.get(bookingId, transaction); //if booking not there booking-repo will give error

    //Validate cancellation status
    if (booking.status === CANCELLED) {
      //if already cancelled
      await transaction.commit();
      return true;
    }

    //If not, call flight-data-service to refund seats
    const updateFlightReqURL = `${config.FLIGHT_SERVICE_PATH}/api/v1/flights/${booking.flightId}/seats`;
    await axios.patch(updateFlightReqURL, {
      seats: booking.noOfSeats, //return this count to seats left there
      dec: false,
    });

    //Update booking status here
    await bookingRepository.update(
      bookingId,
      { status: CANCELLED },
      transaction
    );

    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  createBooking,
  cancelBooking
};

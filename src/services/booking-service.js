const db = require("../models");
const { BookingRepository } = require("../repositories");

const bookingRepository = new BookingRepository();
const config = require("../config/serverConfig");
const axios = require("axios");
const { BOOKING_STATUS } = require("../utils/common/enums");
const { BOOKED, CANCELLED } = BOOKING_STATUS;
// const { ErrorResponse } = require("../utils/common");
const AppError = require("../utils/errors/app-error");

//Create Booking
async function createBooking(data) {
  //Splitting DB Task:
  //Initial DB Lock
  //Start Transaction of Booking DB
  const transaction = await db.sequelize.transaction();
  let booking;
  let flightData;

  try {
    //Microservice call to flight-data-service
    const flightId = data.flightId;
    const getFlightRequestURL = `${config.FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;

    const response = await axios.get(getFlightRequestURL);
    flightData = response.data.data;

    //seat checks
    if (data.noOfSeats > flightData.totalSeats) {
      throw new AppError("Not enough seats available", StatusCodes.BAD_REQUEST);
    }

    const totalBillingAmount = data.noOfSeats * flightData.price;
    const bookingPayload = { ...data, totalCost: totalBillingAmount };

    // Step 2: Create Booking (INITIATED) locally
    booking = await bookingRepository.createBooking(
      bookingPayload,
      transaction
    );

    //Commit fast db lock initially created
    await transaction.commit();
  } catch (error) {
    //rollback
    await transaction.rollback();
    throw error;
  }

  //Step-2: External api call to update seats
  try {
    // Call Flight Service to Update Seats (Pessimistic Lock happens here remotely)
    const updateFlightRequestURL = `${config.FLIGHT_SERVICE_PATH}/api/v1/flights/${booking.flightId}/seats`;
    console.log("FlightSearchURL", updateFlightRequestURL);

    await axios.patch(updateFlightRequestURL, {
      seats: data.noOfSeats,
      dec: true,
    });

    //Finalize update seats
    const finalPayload = {
      status: "BOOKED",
    };
    await bookingRepository.update(booking.id, finalPayload);
    return booking;
  } catch (error) {
    // If the flight service failed (down, or no seats), we must CANCEL the local booking
    console.error("Flight Service failed. Cancelling booking:", booking.id);

    await bookingRepository.update(booking.id, { status: CANCELLED });

    throw new AppError(
      "Booking failed due to flight service error",
      StatusCodes.SERVICE_UNAVAILABLE
    );
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
      seats: booking.noOfSeats, //return `this count to seats left there
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
  cancelBooking,
};

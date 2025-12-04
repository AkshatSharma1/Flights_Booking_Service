const { BookingService } = require("../services");
const { SuccessReponse, ErrorResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const { IdempotencyRepository } = require("../repositories");
const { publishMessage } = require("../utils/messageQueue");
const { REMINDER_BINDING_KEY } = require('../config/serverConfig');
const idempotencyRepository = new IdempotencyRepository();

//Create Booking
async function createBooking(req, res) {
  try {
    const response = await BookingService.createBooking({
      flightId: req.body.flightId,
      userId: req.body.userId,
      noOfSeats: req.body.noOfSeats,
    });

    // 2. Prepare Notification Payload
    // Ideally, fetch user email from Auth Service or User Service here.
    // For MVP, we will hardcode or accept it in body.
    const notificationPayload = {
      subject: "Booking Confirmed",
      content: `Your booking for Flight ${req.body.flightId} is confirmed. Cost: ${response.totalCost}`,
      recepientEmail: "akshat0931@gmail.com", // Replace with real email later
      notificationTime: new Date(),
    };

    // 3. Send Message to Queue (Async)
    // We access the channel we attached to 'app' in server.js
    // req.app.channel is the global channel instance
    publishMessage(
      req.app.channel,
      REMINDER_BINDING_KEY,
      JSON.stringify(notificationPayload)
    );

    SuccessReponse.data = response;

    //NEW LOGIC: If idempotency key was present, save this success response
    if (req.idempotencyKey) {
      await idempotencyRepository.create({
        key: req.idempotencyKey,
        response: SuccessReponse,
        userId: req.body.userId,
      });
    }

    return res.status(StatusCodes.CREATED).json(SuccessReponse);
  } catch (error) {
    console.log("ERROR IN CONTROLLER:", error);
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

//Cancel Booking
async function cancelBooking(req, res) {
  try {
    const response = await BookingService.cancelBooking(req.params.id);
    SuccessReponse.data = response;
    return res.status(StatusCodes.OK).json(SuccessReponse);
  } catch (error) {
    ErrorResponse.error = {
      message: error.message,
      explanation: error.explanation,
      statusCode: error.statusCode,
    };
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports = {
  createBooking,
  cancelBooking,
};

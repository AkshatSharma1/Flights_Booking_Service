const { BookingService } = require("../services");
const { SuccessReponse, ErrorResponse } = require("../utils/common");
const {StatusCodes} = require('http-status-codes')

//Create Booking
async function createBooking(req, res) {
    try {
        const response = await BookingService.createBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            noOfSeats: req.body.noOfSeats
        });

        SuccessReponse.data = response;
        return res.status(StatusCodes.CREATED).json(SuccessReponse);
    } catch (error) {
        console.log("❌ ERROR IN CONTROLLER:", error);
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
    } catch(error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

module.exports = {
    createBooking,
    cancelBooking
}
const express = require('express');
const { BookingController } = require('../../controllers');
const { IdempotencyMiddlewares } = require("../../middlewares");

const router = express.Router();

router.post(
  "/",
  IdempotencyMiddlewares.checkIdempotency,
  BookingController.createBooking
);
router.post('/:id/cancel', BookingController.cancelBooking);

module.exports = router;
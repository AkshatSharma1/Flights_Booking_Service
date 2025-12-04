const { Booking } = require("../models");
const CrudRepository = require("./crud-repository");
const { StatusCodes } = require('http-status-codes')
const { Op } = require("sequelize");
// const { Enums } = require("../utils/common");
// const { BOOKED, CANCELLED, INITIATED } = Enums.BOOKING_STATUS;
 
const { BOOKING_STATUS } = require("../utils/common/enums"); //For avoiding circular dependency
const { BOOKED, CANCELLED, INITIATED } = BOOKING_STATUS;

//Extend from crud repo
class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }

  //override functions
  async createBooking(data, transaction) {
    const response = await Booking.create(data, {
      transaction: transaction,
    });

    return response;
  }

  //get booking
  async get(data, transaction) {
    const response = await Booking.findByPk(data, {
      transaction: transaction,
    });
    if (!response) {
      throw new AppError(
        "Not able to find the resource",
        StatusCodes.NOT_FOUND
      );
    }
    return response;
  }

  //update booking
  async update(id, data, transaction) {
    const response = await Booking.update(data, {
      where: {
        id: id,
      },
      transaction: transaction,
    });
    return response;
  }

  //find expired bookings
  // Find bookings that are stuck in INITIATED state
  // for longer than the provided timestamp
  async findExpiredBookings(timestamp) {
    const response = await Booking.findAll({
      where: {
        status: INITIATED,
        createdAt: {
          [Op.lt]: timestamp, // "Less Than" timestamp
        },
      },
    });
    return response;
  }
}

module.exports = BookingRepository;
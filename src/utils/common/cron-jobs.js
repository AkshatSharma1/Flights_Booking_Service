const cron = require('node-cron');
const { BookingRepository } = require('../../repositories');
const AppError = require('../errors/app-error');
const { BookingService } = require('../../services');
const bookingRepository = new BookingRepository()

function scheduleCrons(){
    //watch the booking repo

    //for every 30 mins(testing: use 1 minute)
    cron.schedule('*/30 * * * *', async()=>{
      console.log("Running Cron Job: checking for expired bookings...");

      //Find: Booking solder than time: here 5 minutes
      const timeLimit = new Date(Date.now() - 5 * 60 * 1000);

      const expiredBookings = await bookingRepository.findExpiredBookings(
        timeLimit
      );

      //if we donot get any
      if (expiredBookings.length == 0) {
        console.log("No expired bookings");
        return;
      }

      console.log(
        `Found ${expiredBookings.length} expired bookings. Cancelling them...`
      );

      // Process cancellation for each
      for (const booking of expiredBookings) {
        try {
          await BookingService.cancelBooking(booking.id);
          console.log(`-- Cancelled Booking ID: ${booking.id}`);
        } catch (error) {
          console.error(`-- Failed to cancel Booking ID: ${booking.id}`, error);
          // throw new AppError(`-- Failed to cancel Booking ID: ${booking.id}. Error: ${error}`,StatusCodes.INTERNAL_SERVER_ERROR )
        }
      }
    })
}

module.exports = scheduleCrons;
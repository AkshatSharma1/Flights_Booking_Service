const { Booking } = require("../models");
const CrudRepository = require("./crud-repository");
const { StatusCodes } = require('http-status-codes')

//Extend from crud repo
class BookingRepository extends CrudRepository{
    constructor(){
        super(Booking);
    }

    //override functions
    async createBooking(data, transaction){
        const response = await Booking.create(data,{
            transaction: transaction
        });

        return response;
    }

    //get booking
    async get(data, transaction){
        const response = await Booking.findByPk(data, {
            transaction: transaction
        });
        if(!response) {
             throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
        }
        return response;
    }

    //update booking
    async update(id, data, transaction) {
        const response = await Booking.update(data, {
            where: {
                id: id
            },
            transaction: transaction
        });
        return response;
    }
}

module.exports = BookingRepository;
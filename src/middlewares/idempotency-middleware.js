const { StatusCodes } = require('http-status-codes');
const { IdempotencyRepository } = require('../repositories');
const { ErrorResponse } = require('../utils/common');
const AppError = require('../utils/errors/app-error');

const idempotencyRepository = new IdempotencyRepository();

async function checkIdempotency(req, res, next) {
    const key = req.headers['x-idempotency-key'];

    // 1. If no key is provided, just proceed (Idempotency is optional but recommended)
    if(!key) {
        return next();
    }

    try {
        // 2. Check if key exists
        const idempotencyKey = await idempotencyRepository.getByKey(key);
        
        // 3. If exists, return the OLD response immediately
        if(idempotencyKey) {
            return res.status(StatusCodes.OK).json(idempotencyKey.response);
        }
        
        // 4. If not, attach the key to request so Controller can use it later
        req.idempotencyKey = key;
        next();

    } catch(error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

module.exports = {
    checkIdempotency
}
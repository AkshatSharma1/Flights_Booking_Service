const { IdempotencyKey } = require('../models');
const CrudRepository = require('./crud-repository');

class IdempotencyRepository extends CrudRepository {
    constructor() {
        super(IdempotencyKey);
    }

    async getByKey(key) {
        const response = await IdempotencyKey.findOne({
            where: {
                key: key
            }
        });
        return response;
    }
}

module.exports = IdempotencyRepository;
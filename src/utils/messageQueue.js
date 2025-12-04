const amqplib = require('amqplib');
const { MESSAGE_BROKER_URL, EXCHANGE_NAME } = require('../config/serverConfig');

let channel;

async function createChannel() {
    try {
        const connection = await amqplib.connect(MESSAGE_BROKER_URL);
        channel = await connection.createChannel();
        
        await channel.assertExchange(EXCHANGE_NAME, 'direct', {
            durable: false
        });
        
        return channel;
    } catch(error) {
        throw error;
    }
}

async function publishMessage(channel, binding_key, message) {
    try {
        await channel.assertQueue('airline_notifications');
        await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
    } catch(error) {
        throw error;
    }
}

module.exports = {
    createChannel,
    publishMessage
}
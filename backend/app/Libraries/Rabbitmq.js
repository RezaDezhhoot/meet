const amqp = require('amqplib/callback_api');

module.exports.directPublish = async (exchangeName, routingKey  , msg , queue  , options = {}) => {
    const opt = { credentials: require('amqplib/callback_api').credentials.plain(process.env.RABBITMQ_USER, process.env.RABBITMQ_PASSWORD) };
    amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`,opt, function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }
            channel.assertExchange(exchangeName, 'direct', {
                durable: false,
                auto_delete: false,
            });
            channel.assertQueue(queue, {
                durable: true
            });
            channel.bindQueue(queue, exchangeName, routingKey);
            channel.publish(exchangeName, routingKey, Buffer.from(msg) , {
                arguments: {
                    // Configure messages to expire after 1 minute, then route them to the retry exchange
                    'x-message-ttl': 60000,
                    'x-dead-letter-exchange': 'retry',
                },
                "delivery_mode": "1"
            });
        });
    });
}
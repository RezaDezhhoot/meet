<?php

namespace App\Services;

use App\Models\RoomDetails;
use App\Models\Setting;
use Carbon\Carbon;
use ErrorException;
use Mockery\Exception;
use PhpAmqpLib\Channel\AMQPChannel;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class RabbitMQService
{
    protected AMQPStreamConnection $connection;
    protected AMQPChannel $channel;
    public function __construct()
    {
        $this->connection = new AMQPStreamConnection(
            config('rabbitmq.host'),
            config('rabbitmq.port'),
            config('rabbitmq.username'),
            config('rabbitmq.password'),
        );
        $this->channel = $this->connection->channel();
    }

    /**
     * @throws ErrorException
     */
    public function consume($exchange , $routingKey , $queue)
    {
        $this->channel->exchange_declare($exchange, 'direct', false, false, false);

        list($queue_name, ,) = $this->channel->queue_declare($queue, false, true, false, false);
        $this->channel->queue_bind($queue_name, $exchange, $routingKey);

        $callback = function ($msg) {
            $data = json_decode($msg->getBody() , true);
            RoomDetails::query()->updateOrCreate([
                'room_id' => $data['room_id']
            ],[
                'data' => $data['users']
            ]);
            $msg->delivery_info['channel']->basic_ack($msg->delivery_info['delivery_tag']);
            echo "Message received.".PHP_EOL;
        };
        $this->channel->basic_consume($queue_name, '', false, false, false, false, $callback);
        try {
            echo " [*] Waiting for messages. To exit press CTRL+C\n";
            $this->channel->consume();
        } catch (\Exception $e) {
            report($e);
            throw $e;
            return 0;
        }
    }

    /**
     * @throws \Exception
     */
    public function __destruct()
    {
        $this->channel->close();
        $this->connection->close();
    }
}

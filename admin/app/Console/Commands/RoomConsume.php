<?php

namespace App\Console\Commands;

use App\Models\RoomDetails;
use App\Models\UserLog;
use App\Services\RabbitMQService;
use ErrorException;
use Illuminate\Console\Command;
use function PHPUnit\Framework\matches;

class RoomConsume extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'consume:rooms {exchange} {routingKey} {queue}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'consume rooms';

    /**
     * Execute the console command.
     * @throws ErrorException
     */
    public function handle()
    {
        $RabbitMQService = new RabbitMQService();

        $callback = match($this->argument('routingKey')) {
            'users' => function ($msg){
                $data = json_decode($msg->getBody() , true);

                try {
                    RoomDetails::query()->updateOrCreate([
                        'room_id' => $data['room_id']
                    ],[
                        'data' => $data['users']
                    ]);
                    echo "User message received.".PHP_EOL;
                } catch (\Exception $e) {
                    report($e);
                    echo "User message has error ".$e->getMessage().PHP_EOL;
                }

                $msg->delivery_info['channel']->basic_ack($msg->delivery_info['delivery_tag']);
            },
            'logs' => function ($msg) {
                $data = json_decode($msg->getBody() , true);

                try {
                    UserLog::query()->create([
                        'room_id' => $data['room_id'],
                        'action' => $data['action'],
                        'user_id' => $data['user_id'] ?? null,
                        'user_ip' => $data['user_ip'],
                        'user_name' => $data['user_name']
                    ]);
                    echo "Log message received.".PHP_EOL;
                } catch (\Exception $e) {
                    report($e);
                    echo "Log message has error ".$e->getMessage().PHP_EOL;
                }

                $msg->delivery_info['channel']->basic_ack($msg->delivery_info['delivery_tag']);
            }
        };


        $RabbitMQService->consume($this->argument('exchange'),$this->argument('routingKey'),$this->argument('queue') , $callback);
    }
}

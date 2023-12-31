<?php

namespace App\Console\Commands;

use App\Services\RabbitMQService;
use ErrorException;
use Illuminate\Console\Command;

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
        $RabbitMQService->consume($this->argument('exchange'),$this->argument('routingKey'),$this->argument('queue'));
    }
}

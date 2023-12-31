<?php

return [
    'host' => env('RABBITMQ_HOST'),
    'username' => env('RABBITMQ_USER'),
    'password' => env('RABBITMQ_PASSWORD'),
    'port' => "5672",
    'vhost' => '/'
];

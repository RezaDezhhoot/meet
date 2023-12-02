<?php

namespace App\Providers;

use App\Hashers\Sha256Hasher;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\ServiceProvider;

class CustomHashServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Hash::extend('sha256', static function () {
            return new Sha256Hasher();
        });
    }
}

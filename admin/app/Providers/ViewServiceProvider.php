<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class ViewServiceProvider extends ServiceProvider
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
        $logo = '';
        $site_name = '';

        try {
            if (Schema::hasTable('settings')) {
                $logo = Setting::getSingleRow('logo');
                $site_name = Setting::getSingleRow('title');
            }
        } catch (\Exception $e) {
            logger($e);
        }
        View::share('logo',$logo);
        View::share('site_title',$site_name);
    }
}

<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::group(['middleware' => 'guest'], function () {
    Route::get('/',\App\Http\Controllers\Auth\AuthController::class)->name('auth');
});

Route::group(['prefix' => 'admin' , 'as' => 'admin.' , 'middleware' => ['auth','role:admin']], function () {
    Route::get('dashboard',\App\Http\Controllers\Dashboard\Dashboard::class)->name('dashboard');
    Route::get('profile',\App\Http\Controllers\Profile\Profile::class)->name('profile');
    Route::group(['prefix' => 'users','as' => 'user.'],function () {
        Route::get('',\App\Http\Controllers\User\IndexUser::class)->name('index');
        Route::get('/{action}/{id?}',\App\Http\Controllers\User\StoreUser::class)->name('store');
    });
    Route::group(['prefix' => 'rooms','as' => 'room.'],function () {
       Route::get('',\App\Http\Controllers\Room\IndexRoom::class)->name('index');
       Route::get('/{action}/{id?}',\App\Http\Controllers\Room\StoreRoom::class)->name('store');
    });
    Route::group(['prefix' => 'roles' , 'as' => 'role.'],function () {
       Route::get('',\App\Http\Controllers\Role\IndexRole::class)->name('index');
       Route::get('/{action}/{id?}',\App\Http\Controllers\Role\StoreRole::class)->name('store');
    });
    Route::group(['prefix' => 'subscriptions' , 'as' => 'subscription.'],function () {
        Route::get('',\App\Http\Controllers\Subscription\IndexSubscription::class)->name('index');
        Route::get('/{action}/{id?}',\App\Http\Controllers\Subscription\StoreSubscription::class)->name('store');
    });
    Route::group(['prefix' => 'chats' , 'as' => 'chat.'],function () {
        Route::get('',\App\Http\Controllers\Chats\Chats::class)->name('index');
    });

    Route::group(['prefix' => 'penalties' , 'as' => 'penalty.'],function () {
        Route::get('',\App\Http\Controllers\Penalties\Penalties::class)->name('index');
    });

    Route::group(['prefix' => 'logs' , 'as' => 'log.'],function () {
        Route::get('',\App\Http\Controllers\Logs\Logs::class)->name('index');
    });

    Route::group(['prefix' => 'feed'],function () {
        Route::get('rooms',[\App\Http\Controllers\FeedController::class,'rooms']);
        Route::get('users',[\App\Http\Controllers\FeedController::class,'users']);
    });

    Route::group(['prefix' => 'settings' , 'as' => 'setting.'],function () {
        Route::get('base',\App\Http\Controllers\Setting\Base::class)->name('base');
    });
});

Route::get('/logout', function (){
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect()->route('auth');
})->name('logout');

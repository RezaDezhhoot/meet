<?php

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
    Route::get('dashboard',function (){
        echo 1;
    })->name('dashboard');
});

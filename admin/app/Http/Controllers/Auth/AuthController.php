<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\BaseComponent;
//use App\Modules\Auth\Rules\ReCaptchaRule;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends BaseComponent
{
    public $recaptcha;
    public $email , $password  ;
    public $passwordLabel = 'رمز عبور';

    public function render()
    {
        return view('admin.auth.auth')->extends('admin.layouts.auth');
    }

    public function login()
    {
        $result = rateLimiter('admin-login');
        if ($result['result']) {
            $this->resetInputs();
            return
                $this->addError('email', 'زیادی تلاش کردید. لطفا پس از مدتی دوباره تلاش کنید.');
        }

        $this->validate([
            'email' => ['required','string','max:250'],
            'password' => ['required','string','max:250'],
        ],[],[
            'phone' => 'ادرس ایمیل یا نام کاربری',
            'password' => 'رمز عبور',
        ]);
        $credentials = [
            'email' => $this->email,
            'password' => $this->password
        ];
        if ( Auth::attempt($credentials,true) ) {
            request()->session()->regenerate();
            RateLimiter::clear($result['key']);
            return redirect()->intended(route('admin.dashboard'));
        } else
            return $this->addError('password','گذواژه یا شماره همراه اشتباه می باشد.');
    }

    private function resetInputs()
    {
        $this->reset(['email', 'password']);
    }
}

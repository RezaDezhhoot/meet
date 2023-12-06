<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\BaseComponent;

class Profile extends BaseComponent
{
    public $user , $name , $password , $email , $phone;

    public function mount()
    {
        $this->user = auth()->user();
        $this->name = $this->user->name;
        $this->email = $this->user->email;
        $this->phone = $this->user->phone;
        $this->header = 'پروفایل';
    }

    public function store()
    {
        $fields = [
            'name' => ['required', 'string','max:150'],
            'phone' => ['required','size:11' , 'unique:users,phone,'. ($this->user->id ?? 0)],
            'email' => ['required','email','max:255' , 'unique:users,email,'. ($this->user->id ?? 0)],
        ];
        $messages = [
            'name' => 'نام ',
            'phone' => 'شماره همراه',
            'email' => 'ایمیل',
        ];
        if (isset($this->password) && !empty($this->password))
        {
            $fields['password'] = ['required','min:6','regex:/^.*(?=.*[a-zA-Z])(?=.*[0-9]).*$/'];
            $messages['password'] = 'گذرواژه';
        }
        $this->validate($fields,[],$messages);
        $this->user->name = $this->name;
        $this->user->phone = $this->phone;
        $this->user->email = $this->email;
        if (isset($this->password))
            $this->user->password = $this->password;
        $this->user->save();
        $this->emitNotify('اطلاعات با موفقیت ثبت شد');
        $this->reset(['password']);
    }

    public function render()
    {
        return view('admin.profile.profile')->extends('admin.layouts.admin');
    }
}

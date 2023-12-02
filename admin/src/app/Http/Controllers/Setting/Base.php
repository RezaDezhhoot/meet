<?php

namespace App\Http\Controllers\Setting;

use App\Http\Controllers\BaseComponent;
use App\Models\Setting;

class Base extends BaseComponent
{
    public $logo , $title , $room_domain;

    public function mount()
    {
        $this->authorizing('edit_base_settings');
        $this->logo = Setting::getSingleRow('logo');
        $this->title = Setting::getSingleRow('title');
        $this->room_domain = Setting::getSingleRow('room_domain');
        $this->header = 'تنظیمات پایه' ;
    }

    public function store()
    {
        $this->validate([
            'title' => ['required','string','max:250'],
            'logo' => ['required','string','max:2000'],
            'room_domain' => ['required','url','max:250']
        ],[],[
            'title' => 'عنوان سامانه',
            'logo' => 'لوگو سامانه',
            'room_domain' => 'دامنه اتاق ها'
        ]);
        Setting::query()->updateOrCreate(['name' => 'title'],['value' => $this->title]);
        Setting::query()->updateOrCreate(['name' => 'logo'],['value' => $this->logo]);
        Setting::query()->updateOrCreate(['name' => 'room_domain'],['value' => $this->room_domain]);
        $this->emitNotify('اطلاعات با موفقیت ثبت شد');
    }

    public function render()
    {
        return view('admin.setting.base')->extends('admin.layouts.admin');
    }
}

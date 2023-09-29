<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\BaseComponent;

class Dashboard extends BaseComponent
{
    public function render()
    {
        return view('admin.dashboard.dashboard')->extends('admin.layouts.admin');
    }
}

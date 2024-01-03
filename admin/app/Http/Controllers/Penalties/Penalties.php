<?php

namespace App\Http\Controllers\Penalties;

use Livewire\Component;

class Penalties extends Component
{
    public function render()
    {
        return view('admin.penlaties.penalties')->extends('admin.layouts.admin');
    }
}

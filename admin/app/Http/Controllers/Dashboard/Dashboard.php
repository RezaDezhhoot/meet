<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\BaseComponent;
use App\Models\Room;
use App\Models\RoomDetails;
use App\Models\Setting;
use App\Models\User;
use App\Services\RabbitMQService;
use Illuminate\Support\Collection;
use Livewire\WithPagination;

class Dashboard extends BaseComponent
{
    public $rooms_count = 0 , $users_count , $placeholder = 'عنوان اتاق اطلاعات میزبان(نام شماره ایمیل)';

    use WithPagination;

    public function mount()
    {
        $this->rooms_count = Room::query()->count();
        $this->users_count = User::query()->count();
    }
    public function render()
    {
        $rooms = RoomDetails::query()
            ->latest()
            ->when($this->search , function ($q) {
                return $q->whereHas('room',function ($q) {
                    return $q->search($this->search)
                        ->orWherehas('host',function ($q){
                            return $q->search($this->search);
                        });
                });
            })->with(['room','room.host'])
            ->paginate($this->per_page);
        return view('admin.dashboard.dashboard' , get_defined_vars())->extends('admin.layouts.admin');
    }

    public function updateList()
    {

    }
}

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

    public $loaded = false , $chart_timer = 0 , $force = false;

    use WithPagination;

    public function mount()
    {
        $this->rooms_count = Room::query()->count();
        $this->users_count = User::query()->count();
    }
    public function render()
    {
        $rooms = $this->getRoom();
        return view('admin.dashboard.dashboard' , get_defined_vars())->extends('admin.layouts.admin');
    }

    public function getRoom()
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

        if ($this->loaded && ($this->chart_timer < time() || $this->force)) {
            $this->chart($rooms);
        }

        $this->loaded = true;

        return $rooms;
    }

    public function refresh() {
        $this->force = true;
    }

    public function chart($rooms)
    {
        $x = [];
        $total = [];
        $guest = [];
        $login = [];

        foreach ($rooms as $room) {
            $x[] = $room->room->title;
            $total[] = count($room->data);
            $login_count = collect($room->data)->filter(function ($v) {
                return $v['media']['type'] == 'login';
            })->count();
            $guest[] = max(count($room->data) - $login_count , 0);
            $login[] = $login_count;
        }

        $this->chart_timer = time() + 35;
        $this->force = false;
        $this->emit('chart',[
            'x' => $x,
            'total' => $total,
            'guest' => $guest,
            'login' => $login,
        ]);
    }
}

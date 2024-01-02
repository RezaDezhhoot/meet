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

    public $loaded = false , $chart_timer = 0 , $emit_chart = false , $chartData = [];

    protected $rooms = [];

    use WithPagination;

    public function mount()
    {
        $this->rooms_count = Room::query()->count();
        $this->users_count = User::query()->count();
    }
    public function render()
    {
        $this->getRoom();
        if ($this->emit_chart) {
            $this->chart();
        }
        $this->emit_chart = true;

        return view('admin.dashboard.dashboard' , ['rooms' => $this->rooms])->extends('admin.layouts.admin');
    }

    public function getRoom()
    {
        $this->rooms = RoomDetails::query()
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
    }


    public function getChartData()
    {
        $data = [];
        foreach ($this->rooms as $room) {
            $data['x'][] = $room->room->title;
            $data['total'][] = count($room->data);
        }
        $this->chart_timer = time() + 35;
        $this->chartData = $data;

        if ($this->loaded) {
            $this->emit('updateChart',$data);
        }
        return $data;
    }


    public function chart()
    {
        $data = $this->getChartData();
        if (! $this->loaded) {
            $this->loaded = true;
            $this->emit('chart',$data);
        }
    }
}

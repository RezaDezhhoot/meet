<?php

namespace App\Http\Controllers\Logs;

use App\Http\Controllers\BaseComponent;
use App\Models\Room;
use App\Models\UserLog;
use Livewire\WithPagination;

class Logs extends BaseComponent
{
    use WithPagination;

    public $room , $placeholder = 'اطلاعات کاربر...';

    public $room_detail = [];

    protected $queryString = ['room'];

    public function mount()
    {
        $this->authorizing('index_logs');
    }

    public function render()
    {
        $items = UserLog::query()
            ->with(['room','user'])
            ->latest()
            ->when($this->room , function ($q) {
                return $q->whereHas('room',function ($q){
                    $this->room_detail = Room::query()->concat()->find($this->room)->toArray();
                    return $q->where('id',$this->room);
                });
            })->when($this->search , function ($q){
                return $q->whereHas('user',function ($q){
                    return $q->search($this->search);
                });
            })->paginate($this->per_page);

        return view('admin.logs.logs' , get_defined_vars())->extends('admin.layouts.admin');
    }
}

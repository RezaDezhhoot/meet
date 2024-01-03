<?php

namespace App\Http\Controllers\Penalties;

use App\Http\Controllers\BaseComponent;
use App\Models\Penalty;
use App\Models\Room;
use Livewire\WithPagination;

class Penalties extends BaseComponent
{
    use WithPagination;

    public $room , $placeholder = 'اطلاعات کاربر...';

    public $room_detail = [];

    protected $queryString = ['room'];

    public function render()
    {
        $items = Penalty::query()
            ->latest()
            ->with(['room','user'])
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
        return view('admin.penalties.penalties' , get_defined_vars())->extends('admin.layouts.admin');
    }

    public function delete($id)
    {
        $this->authorizing('delete_penalties');
        Penalty::destroy($id);
    }
}

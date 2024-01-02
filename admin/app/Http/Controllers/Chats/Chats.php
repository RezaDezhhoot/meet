<?php

namespace App\Http\Controllers\Chats;

use App\Http\Controllers\BaseComponent;
use App\Models\Chat;
use App\Models\Room;
use Livewire\WithPagination;

class Chats extends BaseComponent
{
    use WithPagination;

    public $room , $placeholder = ' متن چت یا اطلاعات (نام ، شماره ، ایمیل) کاربر';

    public $room_detail = [];

    protected $queryString = ['room'];

    public function render()
    {
        $this->authorizing('index_chats');
        $items = Chat::query()->with(['room','user'])->latest()
            ->when($this->room , function ($q) {
                $this->room_detail = Room::query()->select(['id','title as text'])->findOrFail($this->room)->toArray();
                return $q->where('room_id',$this->room);
            })->search($this->search)->paginate($this->per_page);

        return view('admin.chats.chats',get_defined_vars())->extends('admin.layouts.admin');
    }

    public function delete($id)
    {
        $this->authorizing('delete_chats');
        Chat::destroy($id);
    }
}

<?php

namespace App\Http\Controllers\Room;

use App\Enums\RoomStatus;
use App\Http\Controllers\BaseComponent;
use App\Models\Room;
use App\Models\User;
use Illuminate\Validation\Rule;
use function Laravel\Prompts\select;

class StoreRoom extends BaseComponent
{
    public $room , $title , $capacity , $status , $host_id;

    public $user;

    public function mount($action , $id = null)
    {
        $this->authorizing('edit_rooms');
        self::set_mode($action);
        if ($this->mode == self::UPDATE_MODE) {
            $this->room = Room::query()->findOrFail($id);
            $this->title = $this->room->title;
            $this->capacity = $this->room->capacity;
            $this->status = $this->room->status;
            $this->host_id = $this->room->host_id;

            $this->header = $this->title;
        } elseif ($this->mode == self::CREATE_MODE) {
            $this->header = 'اتاق جدید';
        } else abort(404);
        $this->data['status'] = RoomStatus::toArray();
        $this->data['users'] = [];
    }

    public function store()
    {
        if ($this->mode == self::UPDATE_MODE) {
            $this->saveInDataBase($this->room);
        } elseif ($this->mode == self::CREATE_MODE) {
            $this->saveInDataBase(new Room());
            $this->reset(['title','capacity','status','host_id']);
        }
    }

    private function saveInDataBase(Room $room)
    {
        $this->validate([
            'title' => ['required','string','max:250'],
            'capacity' => ['required','integer','between:2,100000'],
            'status' => ['required'],
            'host_id' => ['required','exists:users,id']
        ],[],[
            'title' => 'عنوان',
            'capacity' => 'ظرفیت',
            'host_id' => 'میزبان',
            'status' => 'وضعیت'
        ]);

        $room->title = $this->title;
        $room->capacity = $this->capacity;
        $room->status = $this->status;
        $room->host_id = $this->host_id;
        $room->save();
        $this->emitNotify('اطلاعات با موفقیت ثبت شد');
    }

    public function searchHost()
    {
        $this->data['users'] = User::query()
            ->where('name','like','%'.$this->user.'%')
            ->orWhere('phone','like','%'.$this->user.'%')
            ->orWhere('email','like','%'.$this->user.'%')
            ->take(10)
            ->pluck('name','id')
            ->toArray();
    }

    public function render()
    {
        return view('admin.room.store-room')->extends('admin.layouts.admin');
    }
}

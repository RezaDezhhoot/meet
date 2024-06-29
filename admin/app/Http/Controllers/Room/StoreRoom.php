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
    public $room , $title , $capacity , $status , $host_id , $owner_id , $logo;

    public $user;

    public $owner = [] , $host = [];

    public function mount($action , $id = null)
    {
        $this->authorizing('edit_rooms');
        self::set_mode($action);
        if ($this->mode == self::UPDATE_MODE) {
            $this->room = Room::query()->with(['host' => function($q) {
                return $q->concat();
            },'owner' => function($q) {
                return $q->concat();
            } ])->findOrFail($id);
            $this->title = $this->room->title;
            $this->capacity = $this->room->capacity;
            $this->status = $this->room->status;
            $this->host_id = $this->room->host_id;
            $this->owner_id = $this->room->owner_id;
            $this->logo = $this->room->logo;
            $this->header = $this->title;

            $this->host = $this->room->host->toArray() ?? [];
            $this->owner = $this->room->owner ? $this->room->owner->toArray() : [];

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
            $this->reset(['title','capacity','status','host_id','owner_id','logo']);
        }
    }

    private function saveInDataBase(Room $room)
    {
        $this->validate([
            'title' => ['required','string','max:250'],
            'capacity' => ['required','integer','between:2,100000'],
            'status' => ['required'],
            'host_id' => ['required','exists:users,id'],
            'owner_id' => ['required','exists:users,id'],
            'logo' => ['nullable','string','max:20000']
        ],[],[
            'title' => 'عنوان',
            'capacity' => 'ظرفیت',
            'host_id' => 'میزبان',
            'status' => 'وضعیت',
            'owner_id' => 'مالک',
            'logo' => 'لوگو'
        ]);

        $room->title = $this->title;
        $room->capacity = $this->capacity;
        $room->status = $this->status;
        $room->host_id = $this->host_id;
        $room->owner_id = $this->owner_id;
        $room->logo = $this->logo;
        $room->save();
        $this->emitNotify('اطلاعات با موفقیت ثبت شد');
    }

    public function render()
    {
        return view('admin.room.store-room')->extends('admin.layouts.admin');
    }
}

<?php

namespace App\Http\Controllers\Room;

use App\Enums\RoomStatus;
use App\Http\Controllers\BaseComponent;
use App\Models\Room;
use Illuminate\Support\Str;
use Livewire\WithPagination;

class IndexRoom extends BaseComponent
{
    use WithPagination;

    public $placeholder = 'عنوان اتاق';

    public function mount()
    {
        $this->authorizing('show_rooms');
    }

    public function render()
    {
        $rooms = Room::query()->latest()
            ->paginate($this->per_page);
        return view('admin.room.index-room',get_defined_vars())->extends('admin.layouts.admin');
    }

    public function delete($id)
    {
        $this->authorizing('delete_rooms');
        Room::destroy($id);
    }
}

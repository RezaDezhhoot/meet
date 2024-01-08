<?php

namespace App\Http\Controllers\Room;

use App\Enums\RoomStatus;
use App\Http\Controllers\BaseComponent;
use App\Models\OAuth;
use App\Models\Room;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
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

    public function loginToRoom($id)
    {
        try {
            $frontend_url = rtrim(Setting::getSingleRow('room_domain'),'/');
            $token = OAuth::query()->create([
                'user_id' => auth()->id(),
                'room_id' => $id,
                'token' => Str::uuid()->toString(),
                'expire_at' => now()->addMinutes(2)
            ]);
            if ($token) {
                return redirect()->away("$frontend_url/oauth/{$token->token}");
            } else {
                $this->emitNotify('مشکل در عملیات لاگین','warning');
            }
        } catch (\Exception $e) {
            report($e);
            $this->emitNotify('مشکل در عملیات لاگین','warning');
        }
        return 0;
    }

    public function delete($id)
    {
        $this->authorizing('delete_rooms');
        Room::destroy($id);
    }
}

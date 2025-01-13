<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\RoomStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CreateRoomRequest;
use App\Http\Requests\Api\IndexRoomRequest;
use App\Http\Resources\Api\V1\RoomResource;
use App\Models\AccessToken;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function store(CreateRoomRequest $request) {
        $token = AccessToken::query()->where('value',$request->token)->first();
        $data = [
            ... $request->only(['title','capacity']),
            'user_id' => $token->user_id,
            'owner_id' =>  $token->user_id,
            'logo' => 'storage/'.$request->file('logo')->store('rooms','public'),
            'status' => RoomStatus::OPEN
        ];
        $room = Room::query()->create($data);
        return RoomResource::make($room);
    }

    public function index(IndexRoomRequest $request) {
        $token = AccessToken::query()->where('value',$request->token)->firstOrFail();
        $rooms = Room::query()->latest()
            ->whereHas('host', function ($q) use ($token) {
                $q->where('id',$token->user_id);
            })->paginate(10);

        return RoomResource::collection($rooms);
    }

    public function show($room , IndexRoomRequest $request) {
        $token = AccessToken::query()->where('value',$request->token)->firstOrFail();
        $roomModel = Room::query()->latest()
            ->where(function ($q) use ($room) {
                $q->where('id' , $room)->orWhere('key' , $room);
            })
            ->whereHas('host', function ($q) use ($token) {
                $q->where('id',$token->user_id);
            })->first();

        return RoomResource::make($roomModel);
    }
}

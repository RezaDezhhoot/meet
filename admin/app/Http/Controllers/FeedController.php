<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    public function rooms(Request $request): JsonResponse
    {
        $items = Room::query()->when($request->filled('search'),function ($q) use ($request){
            return $q->search($request->get('search'));
        })->concat()->take(10)->get()->toArray();
        return response()->json($items);
    }

    public function users(Request $request): JsonResponse
    {
        $items = User::query()->latest()->when($request->filled('search'),function ($q) use ($request){
            return $q->search($request->get('search'));
        })->concat()->take(10)->get()->toArray();

        return response()->json($items);
    }
}

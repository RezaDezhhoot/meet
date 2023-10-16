<?php

namespace App\Models;

use App\Enums\RoomStatus;
use App\Traits\Admin\Searchable;
use App\Traits\UuidModel;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property mixed $status
 * @property mixed $title
 * @property mixed $capacity
 * @property mixed $host_id
 */
class Room extends Model
{
    use HasFactory  , Searchable;

    protected $guarded = ['id'];

    protected array $searchAbleColumns = ['title'];

    protected $casts = [
        'status' => RoomStatus::class
    ];

    public function statusLabel(): Attribute
    {
        return Attribute::get(fn() => $this->status ? $this->status->label() : '-');
    }

    public function roomLink(): Attribute
    {
        return Attribute::get(function (){
            $queryParam = [
                'room' => $this->key,
            ];
            $queryString = http_build_query($queryParam);
            return Setting::getSingleRow('room_domain') . '?' . $queryString;
        });
    }

    public function host(): BelongsTo
    {
        return  $this->belongsTo(User::class,'host_id');
    }
}

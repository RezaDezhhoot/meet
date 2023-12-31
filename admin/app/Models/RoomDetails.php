<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomDetails extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function data(): Attribute
    {
        return Attribute::make(
            get: fn($value) => json_decode($value , true),
            set: fn($value) => json_encode($value)
        );
    }
}

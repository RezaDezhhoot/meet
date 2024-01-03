<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Morilog\Jalali\Jalalian;

/**
 * @property mixed $kicked_at
 */
class Penalty extends Model
{
    use HasFactory;

    protected $appends = ['kicked_date'];
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function kickedDate(): Attribute
    {
        return Attribute::get(fn() => Jalalian::forge($this->kicked_at)->format('%A, %d %B %Y'));
    }
}

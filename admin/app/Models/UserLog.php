<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Morilog\Jalali\Jalalian;

/**
 * @property mixed $created_at
 */
class UserLog extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function action(): Attribute
    {
        return Attribute::get(fn($value) => __(key: "general.$value" , locale: 'fa'));
    }

    public function createdAt(): Attribute
    {
        return Attribute::get(fn($value) => Jalalian::forge($value)->format('%A, %d %B %Y  %H:%M'));
    }
}

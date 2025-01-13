<?php

namespace App\Models;

use App\Traits\Admin\Searchable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Morilog\Jalali\Jalalian;

class AccessToken extends Model
{
    use HasFactory , Searchable;

    public array $searchAbleColumns = ['title'];

    const SALT = '#Q$r-o12^7&kLp@2';

    protected $guarded = ['id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function expire(): Attribute
    {
        return Attribute::get(fn() => $this->expire_at ? Jalalian::forge($this->expire_at)->format('%A, %d %B %Y') : null);
    }
}

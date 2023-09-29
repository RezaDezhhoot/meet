<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use App\Traits\Admin\Searchable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property mixed $title
 * @property mixed $amount
 * @property mixed $validity
 * @property mixed $description
 * @property mixed $status
 * @property mixed $image
 */
class Subscription extends Model
{
    use HasFactory , SoftDeletes , Searchable;

    protected array $searchAbleColumns = ['title'];

    protected $guarded = ['id'];

    protected $casts = [
        'status' => SubscriptionStatus::class
    ];

    public function image(): Attribute
    {
        return Attribute::make(
            set: fn($value) => str_replace(config('filesystems.disks.public.url'),'',$value)
        );
    }

    public function statusLabel(): Attribute
    {
        return Attribute::get(fn() => $this->status ? $this->status->label() : '-');
    }
}

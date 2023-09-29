<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserStatus;
use App\Traits\Admin\Searchable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property mixed $email
 * @property mixed $phone
 * @property mixed $name
 * @property mixed $password
 * @property mixed $status
 * @property \Illuminate\Support\Carbon|mixed $verified_at
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable , HasRoles , Searchable;

    protected array $searchAbleColumns = ['name','email','phone'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $guarded = [
        'id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'password' => 'hashed',
        'status' => UserStatus::class
    ];

    public function statusLabel(): Attribute
    {
        return Attribute::get(fn() => $this->status ? $this->status->label() : '-');
    }

    public function password(): Attribute
    {
        return Attribute::set(fn($value) => Hash::make($value));
    }

    public function subscription(): BelongsToMany
    {
        return $this->belongsToMany(Subscription::class,'users_has_subscriptions');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = ['name','value'];

    public static function getSingleRow($name, $default = '')
    {
        return self::where('name', $name)->first()->value ?? $default;
    }

    public function value(): Attribute
    {
        return  Attribute::make(
            get: function($value) {
                $data = json_decode($value, true);
                return is_array($data) ? $data : $value;
            }
        );
    }
}

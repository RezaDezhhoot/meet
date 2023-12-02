<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait UuidModel
{
    /**
     * Get the value indicating whether the IDs are incrementing.
     * Overwrite the method to always return false to disable auto incrementing as we are using UUID.
     *
     * @return bool
     */
    public function getIncrementing() {
        return false;
    }


    protected static function boot() {
        parent::boot();

        static::creating(function ($model) {
            if ($model->getKey() === null) {
                $model->setAttribute($model->getKeyName(), Str::uuid()->toString());
            }
        });
    }

    public function getKeyType ()
    {
        return 'string';
    }
}

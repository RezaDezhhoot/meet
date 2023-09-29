<?php

namespace App\Traits;

trait ArrayableEnum
{
    /**
     * Returns enum values as an array.
     */
    static function toArray(): array
    {
        $values = [];

        foreach (self::cases() as $index => $enumCase) {
            $values[$enumCase->value] = $enumCase->label() ?? $enumCase->name;
        }

        return $values;
    }

}

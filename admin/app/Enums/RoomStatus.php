<?php

namespace App\Enums;

use App\Traits\ArrayableEnum;

enum RoomStatus: string
{
    use ArrayableEnum;

    case OPEN = 'open';
    case CLOSE = 'close';

    public function label(): string
    {
        return match($this) {
            RoomStatus::OPEN => 'باز',
            RoomStatus::CLOSE => 'بسته',
        };
    }
}

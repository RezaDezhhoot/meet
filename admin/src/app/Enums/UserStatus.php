<?php

namespace App\Enums;

use App\Traits\ArrayableEnum;

enum UserStatus: string
{
    use ArrayableEnum;

    case PENDING = 'pending';
    case VERIFIED = 'verified';

    public function label(): string
    {
        return match($this) {
            UserStatus::PENDING => 'تایید نشده',
            UserStatus::VERIFIED => 'تایید شده',
            default => '-'
        };
    }
}

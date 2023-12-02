<?php

namespace App\Enums;

use App\Traits\ArrayableEnum;

enum SubscriptionStatus: string
{
    use ArrayableEnum;

    case PUBLISHED = 'published';
    case DRAFT = 'draft';

    public function label(): string
    {
        return match($this) {
            SubscriptionStatus::PUBLISHED => 'منتشر شده',
            SubscriptionStatus::DRAFT => 'پیشنویس',
            default => '-'
        };
    }
}

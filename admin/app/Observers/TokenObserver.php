<?php

namespace App\Observers;

use App\Models\AccessToken;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TokenObserver
{
    /**
     * Handle the AccessToken "created" event.
     */
    public function created(AccessToken $accessToken): void
    {
        $value = Hash::make(AccessToken::SALT.$accessToken->user_id);
        $accessToken->update([
            'value' => $value
        ]);
    }
}

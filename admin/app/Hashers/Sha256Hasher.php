<?php

namespace App\Hashers;

use Illuminate\Contracts\Hashing\Hasher;
use Illuminate\Hashing\AbstractHasher;

class Sha256Hasher extends AbstractHasher implements Hasher
{
    public function make($value, array $options = []): string
    {
        return hash('sha256',$value);
    }

    public function check($value, $hashedValue, array $options = []): bool
    {
        return $this->make($value) === $hashedValue;
    }

    public function needsRehash($hashedValue, array $options = []): bool
    {
        return false;
    }
}

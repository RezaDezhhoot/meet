<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexRoomRequest extends FormRequest
{
    protected function prepareForValidation()
    {
        if ($this->hasHeader('X-API-Token')) {
            $this->merge([
                'token' => $this->header('X-API-Token')
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'token' => ['required',Rule::exists('access_tokens','value')]
        ];
    }
}

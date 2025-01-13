<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateRoomRequest extends FormRequest
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
            'title' => ['required','string','max:75'],
            'capacity' => ['required','integer','min:2','max:50'],
            'logo' => ['required',Rule::imageFile()->max(5 * 1024)],
            'token' => ['required',Rule::exists('access_tokens','value')]
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:120', 'regex:/^[\pL\pM\pN][\pL\pM\pN .\'-]*$/u'],
            'email' => ['required', 'string', 'email:rfc', 'max:255', 'unique:users,email,'.$this->user()->id],
        ];
    }
}

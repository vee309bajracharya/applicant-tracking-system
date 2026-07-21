<?php

namespace App\Http\Requests\Interview;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInterviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('interviews.manage');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'interview_date' => ['sometimes', 'date'],
            'interview_type' => ['sometimes', 'in:online,offline'],
            'meeting_link' => ['nullable', 'string', 'max:500'],
            'status' => ['sometimes', 'in:scheduled,completed,cancelled'],
        ];
    }
}

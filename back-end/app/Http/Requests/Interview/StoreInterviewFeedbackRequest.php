<?php

namespace App\Http\Requests\Interview;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreInterviewFeedbackRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('candidate.notes.create') || $this->user()->can('interviews.manage');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'rating_score' => ['required', 'integer', 'min:1', 'max:5'],
            'notes' => ['nullable', 'string'],
        ];
    }
}

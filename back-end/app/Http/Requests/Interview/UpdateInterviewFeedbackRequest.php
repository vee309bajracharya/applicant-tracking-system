<?php

namespace App\Http\Requests\Interview;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInterviewFeedbackRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $feedback = $this->route('feedback');
        return $feedback->reviewer_id === $this->user()->id || $this->user()->can('interviews.manage');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'rating_score' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'notes' => ['nullable', 'string'],
        ];
    }
}

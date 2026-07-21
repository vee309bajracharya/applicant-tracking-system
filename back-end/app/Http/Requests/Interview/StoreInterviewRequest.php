<?php

namespace App\Http\Requests\Interview;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreInterviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('interviews.manage');
    }

    protected function prepareForValidation(): void
    {
        if (!$this->filled('interview_type')) {
            $this->merge(['interview_type' => 'offline']);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'application_id' => ['required', 'integer', 'exists:applications,id'],
            'recruiter_id' => ['required', 'integer', 'exists:users,id'],
            'interview_date' => ['required', 'date', 'after:now'],
            'interview_type' => ['sometimes', 'in:online,offline'],
            'meeting_link' => ['nullable', 'string', 'max:500', 'required_if:interview_type,online'],
        ];
    }
}

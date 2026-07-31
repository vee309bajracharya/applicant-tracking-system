<?php

namespace App\Http\Requests\Application;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreApplicationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('applications.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'job_id' => [
                'required',
                'integer',
                Rule::exists('job_postings', 'id')->where('status', 'open'),
            ],
            'resume_id' => ['required', 'integer', 'exists:resumes,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'job_id.exists' => 'This job is no longer accepting applications.',
        ];
    }
}

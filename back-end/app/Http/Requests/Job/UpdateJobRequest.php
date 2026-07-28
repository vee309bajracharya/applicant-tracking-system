<?php

namespace App\Http\Requests\Job;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateJobRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('jobs.edit');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'department_id' => ['sometimes', 'integer', 'exists:departments,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'employment_type' => ['sometimes', 'in:full_time,part_time,internship,contract'],
            'location' => ['sometimes', 'string', 'max:255'],
            'experience_required' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:99.9'],
            'salary_min' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'salary_max' => ['sometimes', 'nullable', 'numeric', 'gte:salary_min'],
            'description' => ['sometimes', 'string'],
            'deadline' => ['sometimes', 'nullable', 'date', 'after:today'],
            'status' => ['sometimes', 'in:open,closed,draft'],
            'skills' => ['sometimes', 'array'],
            'skills.*.skill_id' => ['required_with:skills', 'integer', 'exists:skills,id'],
            'skills.*.importance' => ['sometimes', 'in:required,preferred'],
        ];
    }
}

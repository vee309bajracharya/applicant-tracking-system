<?php

namespace App\Http\Requests\Job;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreJobRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('jobs.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'title' => ['required', 'string', 'max:255'],
            'employment_type' => ['required', 'in:full_time,part_time,internship,contract'],
            'location' => ['required', 'string', 'max:255'],
            'experience_required' => ['nullable', 'numeric', 'min:0', 'max:99.9'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'gte:salary_min'],
            'description' => ['required', 'string'],
            'status' => ['sometimes', 'in:open,closed,draft'],
            'deadline' => ['nullable', 'date', 'after:today'],
            'skills' => ['sometimes', 'array'],
            'skills.*.skill_id' => ['required_with:skills', 'integer', 'exists:skills,id'],
            'skills.*.importance' => ['sometimes', 'in:required,preferred'],
        ];
    }
}

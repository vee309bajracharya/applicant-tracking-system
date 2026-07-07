<?php

namespace App\Http\Requests\Company;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AssignCompanyUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('companies.manage');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'designation' => ['required', 'string', 'max:100'],
            'joined_at' => ['nullable', 'date'],
        ];
    }

    // additional rule
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {

            $user = User::find($this->user_id);
            if (!$user)
                return;

            if (!$user->hasAnyRole(['hr_manager', 'recruiter'])) {
                $validator->errors()->add(
                    'user_id',
                    'Only HR Managers and Recruiters can be assigned to a company'
                );
                return;
            }

            // prevent assigning one employee to multiple companies
            if ($user->companies()->exists()) {
                $validator->errors()->add(
                    'user_id',
                    'This user is already assigned to a company'
                );
            }
        });
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'user_id.required' => 'Please select an employee',
            'user_id.exists' => 'The selected employee does not exist',
        ];
    }
}

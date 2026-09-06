<?php

namespace App\Http\Requests\Interview;

use App\Models\Application;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
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

    // user must be a recruiter and must belong to the same company as the application
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $recruiterId = $this->input('recruiter_id');
            $applicationId = $this->input('application_id');

            if (!$recruiterId)
                return;

            $recruiter = User::find($recruiterId);

            if ($recruiter && !$recruiter->hasRole('recruiter')) {
                $validator->errors()->add(
                    'recruiter_id',
                    'The selected user is not a recruiter.'
                );

                return; // no point checking company match on a non-recruiter
            }

            if (!$applicationId || !$recruiter)
                return;

            $application = Application::with('job')->find($applicationId);

            if ($application && $application->job && $application->job->company_id !== $recruiter->assignedCompanyId()) {
                $validator->errors()->add(
                    'recruiter_id',
                    'The selected recruiter does not belong to the same company as this application.'
                );
            }
        });
    }
}

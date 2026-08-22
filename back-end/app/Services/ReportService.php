<?php

namespace App\Services;

use App\Models\CandidateProfile;
use App\Models\Interview;
use App\Models\Job;
use App\Models\User;
use Illuminate\Support\Collection;

class ReportService
{
    // one row per job: applicant counts broken down by pipeline stage
    // HR only sees their own company's jobs , Admin sees all jobs
    public function hiringReport(User $user): Collection
    {
        return Job::query()
            ->with(['company', 'department'])
            ->when(
                $user->isScopedToCompany(),
                fn($query) => $query->where('company_id', $user->assignedCompanyId())
            )
            ->withCount([
                'applications',
                'applications as applied_count' => fn($q) => $q->where('status', 'applied'),
                'applications as screening_count' => fn($q) => $q->where('status', 'screening'),
                'applications as shortlisted_count' => fn($q) => $q->where('status', 'shortlisted'),
                'applications as interview_count' => fn($q) => $q->where('status', 'interview'),
                'applications as selected_count' => fn($q) => $q->where('status', 'selected'),
                'applications as rejected_count' => fn($q) => $q->where('status', 'rejected'),
                'applications as hired_count' => fn($q) => $q->where('status', 'hired'),
            ])
            ->latest()
            ->get();
    }

    // one row per candidate: profile completeness, resume/skill counts, application volume
    // HR only sees candidates who have actually applied to their company
    public function candidateSummary(User $user): Collection
    {
        $companyId = $user->isScopedToCompany() ? $user->assignedCompanyId() : null;
        return CandidateProfile::query()
            ->with('user')
            ->when(
                $companyId,
                fn($query) => $query->whereHas('applications.job', fn($jobQuery) => $jobQuery->where('company_id', $companyId))
            )
            ->withCount([
                'resumes',
                'skills',
                'applications' => fn($q) => $companyId
                    ? $q->whereHas('job', fn($jobQuery) => $jobQuery->where('company_id', $companyId))
                    : $q,
            ])
            ->get();
    }

    // one row per interview: candidate, job, interviewer, and averaged feedback rating.
    // HR only sees interviews tied to their own company's job applications.
    public function interviewScoreSheet(User $user): Collection
    {
        return Interview::query()
            ->with(['application.candidateProfile.user', 'application.job', 'recruiter', 'feedback'])
            ->when(
                $user->isScopedToCompany(),
                fn($q) => $q->whereHas('application.job', fn($jobQuery) => $jobQuery->where('company_id', $user->assignedCompanyId()))
            )
            ->latest('interview_date')
            ->get()
            ->map(function (Interview $interview) {
                $interview->average_rating = $interview->feedback->isNotEmpty()
                    ? round($interview->feedback->avg('rating_score'), 1)
                    : null;

                return $interview;
            });
    }
}

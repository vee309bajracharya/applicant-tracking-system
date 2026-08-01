<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\CandidateProfile;
use App\Models\Company;
use App\Models\Interview;
use App\Models\Job;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    protected const PIPELINE_STATUSES = [
        'applied',
        'screening',
        'shortlisted',
        'interview',
        'selected',
        'hired',
        'rejected',
    ];

    protected const JOB_STATUSES = [
        'open',
        'closed',
        'draft',
    ];

    //each user roles get a different dashboard view but they share same pipeline
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->getRoleNames()->first();

        $data = match ($role) {
            'admin' => $this->adminDashboard(),
            'hr_manager', 'recruiter' => $this->staffDashboard($user, $role),
            'candidate' => $this->candidateDashboard($user),
            default => [
                'role' => $role,
                'stats' => []
            ],
        };

        return response()->json([
            'success' => true,
            'data' => $data,
        ], 200);
    }

    protected function adminDashboard(): array
    {
        $jobsByStatus = $this->countByStatus(Job::query(), self::JOB_STATUSES);
        $pipeline = $this->countByStatus(Application::query(), self::PIPELINE_STATUSES, 'status');
        $usersByRole = DB::table('model_has_roles')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->select('roles.name', DB::raw('count(*) as total'))
            ->groupBy('roles.name')
            ->pluck('total', 'name');

        return [
            'role' => 'admin',
            'stats' => [
                ['label' => 'Companies', 'value' => Company::count()],
                ['label' => 'Total Users', 'value' => User::count()],
                ['label' => 'Open Jobs', 'value' => $jobsByStatus['open'] ?? 0],
                ['label' => 'Total Applications', 'value' => array_sum($pipeline)],
            ],
            'jobs_by_status' => $jobsByStatus,
            'users_by_role' => $usersByRole,
            'pipeline' => $pipeline,
        ];
    }

    protected function staffDashboard(User $user, string $role): array
    {
        // HR Managers/Recruiters belong to exactly one company. Scope everything to that company; if unassigned, return zeros
        $company = $user->companies()->first();
        $jobIds = $company ? Job::where('company_id', $company->id)->pluck('id') : collect();

        $jobsByStatus = $company
            ? $this->countByStatus(Job::where('company_id', $company->id), self::JOB_STATUSES)
            : array_fill_keys(self::JOB_STATUSES, 0);

        $applicationsQuery = $jobIds->isNotEmpty() ? Application::whereIn('job_id', $jobIds) : Application::whereRaw('1=0');
        $pipeline = $this->countByStatus($applicationsQuery, self::PIPELINE_STATUSES, 'status');

        $upcomingInterviewsQuery = Interview::where('status', 'scheduled')->where('interview_date', '>=', now());
        // Recruiters see their own assigned interviews; HR sees every upcoming interview across the company's jobs.
        if ($role === 'recruiter') {
            $upcomingInterviewsQuery->where('recruiter_id', $user->id);
        } elseif ($jobIds->isNotEmpty()) {
            $upcomingInterviewsQuery->whereHas('application', fn($q) => $q->whereIn('job_id', $jobIds));
        } else {
            $upcomingInterviewsQuery->whereRaw('1=0');
        }

        return [
            'role' => $role,
            'company' => $company ? ['id' => $company->id, 'company_name' => $company->company_name] : null,
            'stats' => [
                ['label' => 'Open jobs', 'value' => $jobsByStatus['open'] ?? 0],
                ['label' => 'Active Applications', 'value' => array_sum($pipeline) - ($pipeline['hired'] ?? 0) - ($pipeline['rejected'] ?? 0)],
                ['label' => 'Upcoming Interviews', 'value' => $upcomingInterviewsQuery->count()],
                ['label' => 'Hired', 'value' => $pipeline['hired'] ?? 0],
            ],
            'jobs_by_status' => $jobsByStatus,
            'pipeline' => $pipeline,
        ];
    }

    protected function candidateDashboard(User $user): array
    {
        $candidateProfile = CandidateProfile::where('user_id', $user->id)->first();

        if (!$candidateProfile) {
            return [
                'role' => 'candidate',
                'stats' => [],
                'pipeline' => array_fill_keys(self::PIPELINE_STATUSES, 0),
                'profile_completion' => 0,
            ];
        }

        $pipeline = $this->countByStatus(
            Application::where('candidate_id', $candidateProfile->id),
            self::PIPELINE_STATUSES,
            'status'
        );

        return [
            'role' => 'candidate',
            'stats' => [
                ['label' => 'Applications Submitted', 'value' => array_sum($pipeline)],
                ['label' => 'In Interview Stage', 'value' => $pipeline['interview'] ?? 0],
                ['label' => 'Hired', 'value' => $pipeline['hired'] ?? 0],
                ['label' => 'Profile Completion', 'value' => $candidateProfile->profile_completion_percentage . '%'],
            ],
            'pipeline' => $pipeline,
            'profile_completion' => $candidateProfile->profile_completion_percentage,
        ];
    }

    protected function countByStatus($query, array $statuses, string $column = 'status'): array
    {
        $counts = (clone $query)
            ->select($column, DB::raw('count(*) as total'))
            ->groupBy($column)
            ->pluck('total', $column);

        return collect($statuses)->mapWithKeys(fn($status) => [$status => (int) ($counts[$status] ?? 0)])->toArray();
    }
}

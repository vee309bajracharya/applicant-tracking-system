<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Http\Requests\Application\StoreApplicationRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\ApplicationStatusHistory;
use App\Models\CandidateProfile;
use App\Traits\LoadsApplicationRelations;
use Illuminate\Http\Request;

class CandidateApplicationController extends Controller
{
    use LoadsApplicationRelations;

    // GET /candidate/applications — own application history + live status
    public function index(Request $request)
    {
        $profile = CandidateProfile::where('user_id', $request->user()->id)->firstOrFail();

        $applications = $profile->applications()
            ->with($this->applicationRelations())
            ->latest('applied_at')
            ->paginate(10);

        return ApplicationResource::collection($applications);
    }

    public function store(StoreApplicationRequest $request)
    {
        $profile = CandidateProfile::where('user_id', $request->user()->id)->firstOrFail();

        // uq_apps_job_candidate DB constraint backstops this, but check early for a clean error
        abort_if(
            $profile->applications()->where('job_id', $request->validated('job_id'))->exists(),
            422,
            'You have already applied to this job.'
        );

        $application = $profile->applications()->create([
            'job_id' => $request->validated('job_id'),
            'resume_id' => $request->validated('resume_id'),
            'status' => 'applied',
            'applied_at' => now(),
        ]);

        ApplicationStatusHistory::create([
            'application_id' => $application->id,
            'old_status' => null,
            'new_status' => 'applied',
            'changed_by' => $request->user()->id,
            'reason' => 'Initial application submission.',
            'created_at' => now(),
        ]);

        // TODO Phase 5: trigger keyword extraction + initial match score build here

        return ApplicationResource::make($application->fresh()->load($this->applicationRelations()))
            ->response()
            ->setStatusCode(201);
    }
}

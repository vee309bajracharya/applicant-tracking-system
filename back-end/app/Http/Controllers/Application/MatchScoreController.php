<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Services\MatchScoreService;
use App\Traits\EnforcesCompanyScope;
use App\Traits\LoadsApplicationRelations;
use Illuminate\Http\Request;

class MatchScoreController extends Controller
{
    use LoadsApplicationRelations, EnforcesCompanyScope;

    public function __construct(protected MatchScoreService $matcher)
    {
    }

    // force recompute (e.g. after profile/resume edits)
    public function recompute(Request $request, Application $application)
    {
        $this->assertApplicationCompanyAccess($request, $application);
        $this->matcher->generate($application);

        return ApplicationResource::make($application->fresh()->load($this->applicationRelations()));
    }

    // required / candidate set difference
    public function skillGap(Request $request, Application $application)
    {
        $this->assertApplicationCompanyAccess($request, $application);
        return response()->json([
            'success' => true,
            'message' => 'Skill gap computed successfully.',
            'data' => [
                'application_id' => $application->id,
                'missing_skills' => $this->matcher->skillGap($application),
            ],
        ], 200);
    }

    // candidates for a job, sorted desc by final_score
    public function rankedForJob(Request $request, int $job)
    {
        $query = Application::with($this->applicationRelations())->where('job_id', $job);

        if ($request->user()->isScopedToCompany())
            $query->whereHas('job', fn($query) => $query->where('company_id', $request->user()->assignedCompanyId()));

        $ranked = $this->matcher->rankByFinalScore($query->get());

        return ApplicationResource::collection($ranked);
    }
}

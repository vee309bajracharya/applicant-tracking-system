<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Http\Requests\Application\UpdateApplicationStatusRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Services\ApplicationPipelineService;
use App\Services\MatchScoreService;
use App\Traits\LoadsApplicationRelations;
use Illuminate\Http\Request;
use InvalidArgumentException;

class ApplicationController extends Controller
{
    use LoadsApplicationRelations;

    public function __construct(protected ApplicationPipelineService $pipeline, protected MatchScoreService $matcher)
    {
    }

    public function index(Request $request)
    {
        $query = Application::with($this->applicationRelations());

        if ($jobId = $request->query('job_id'))
            $query->where('job_id', $jobId);

        if ($status = $request->query('status'))
            $query->where('status', $status);

        // sort=match_score ranks by computed final_score desc (Candidate Ranking Algorithm)
        if ($request->query('sort') === 'match_score') {
            $applications = $query->get();
            $ranked = $this->matcher->rankByFinalScore($applications);

            return ApplicationResource::collection($ranked);
        }

        return ApplicationResource::collection($query->latest('applied_at')->paginate(10));
    }

    public function show(Application $application)
    {
        return ApplicationResource::make($application->load($this->applicationRelations()));
    }

    // status transitions gated per-status below — request only checks base applications.view
    public function updateStatus(UpdateApplicationStatusRequest $request, Application $application)
    {
        $status = $request->validated('status');

        $finalOutcomes = ['selected', 'rejected', 'hired'];
        $requiredPerm = in_array($status, $finalOutcomes, true) ? 'hiring.manage' : 'applications.screen';

        abort_unless(
            $request->user()->can($requiredPerm),
            403,
            "You lack the '{$requiredPerm}' permission for this transition."
        );

        try {
            $updated = $this->pipeline->transition(
                $application,
                $status,
                $request->user()->id,
                $request->validated('reason')
            );
        } catch (InvalidArgumentException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return ApplicationResource::make($updated->load($this->applicationRelations()));
    }
}

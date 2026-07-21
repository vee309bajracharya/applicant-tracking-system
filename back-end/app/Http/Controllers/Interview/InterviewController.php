<?php

namespace App\Http\Controllers\Interview;

use App\Http\Controllers\Controller;
use App\Http\Requests\Interview\StoreInterviewRequest;
use App\Http\Requests\Interview\UpdateInterviewRequest;
use App\Http\Resources\InterviewResource;
use App\Models\Application;
use App\Models\Interview;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class InterviewController extends Controller
{
    public function __construct(protected NotificationService $notifier)
    {
    }
    protected function relations(): array
    {
        return ['recruiter', 'feedback.reviewer'];
    }

    public function index(Application $application)
    {
        $interviews = $application->interviews()->with($this->relations())->latest('interview_date')->get();

        return InterviewResource::collection($interviews);
    }

    public function store(StoreInterviewRequest $request)
    {
        $application = Application::with(['candidateProfile', 'job'])->findOrFail($request->validated('application_id'));

        // the scheduling applies only if the pipeline has reached to interview stage
        abort_unless($application->status === 'interview', 422, "Application must be in the 'interview' stage before scheduling. Current Status : '{$application->status}'");

        $interview = Interview::create($request->validated());

        $this->notifier->dispatch(
            $application->candidateProfile->user_id,
            'Interview scheduled',
            "An interview for \"{$application->job->title}\" has been scheduled for {$interview->interview_date}."
        );

        return InterviewResource::make($interview->fresh()->load($this->relations()))->response()->setStatusCode(201);
    }

    public function update(UpdateInterviewRequest $request, Interview $interview)
    {
        $interview->update($request->validated());

        return InterviewResource::make($interview->fresh()->load($this->relations()));
    }

    public function cancel(Request $request, Interview $interview)
    {
        abort_unless($request->user()->can('interviews.manage'), 403);

        $interview->update(['status' => 'cancelled']);

        return InterviewResource::make($interview->fresh()->load($this->relations()));
    }
}

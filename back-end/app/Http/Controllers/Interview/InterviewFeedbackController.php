<?php

namespace App\Http\Controllers\Interview;

use App\Http\Controllers\Controller;
use App\Http\Requests\Interview\StoreInterviewFeedbackRequest;
use App\Http\Requests\Interview\UpdateInterviewFeedbackRequest;
use App\Http\Resources\InterviewFeedbackResource;
use App\Models\Interview;
use App\Models\InterviewFeedback;
use Illuminate\Http\Request;

class InterviewFeedbackController extends Controller
{
    public function store(StoreInterviewFeedbackRequest $request, Interview $interview)
    {
        $feedback = InterviewFeedback::create([
            'interview_id' => $interview->id,
            'reviewer_id' => $request->user()->id,
            'rating_score' => $request->validated('rating_score'),
            'notes' => $request->validated('notes'),
        ]);

        return InterviewFeedbackResource::make($feedback->load('reviewer'))->response()->setStatusCode(201);
    }

    public function update(UpdateInterviewFeedbackRequest $request, InterviewFeedback $feedback)
    {
        $feedback->update($request->validated());

        return InterviewFeedbackResource::make($feedback->fresh()->load('reviewer'));
    }

    public function destroy(Request $request, InterviewFeedback $feedback)
    {
        abort_unless($feedback->reviewer_id === $request->user()->id || $request->user()->can('interviews.manage'), 403);

        $feedback->delete();

        return response()->json([
            'success' => true,
            'message' => 'Interview feedback deleted successfully',
        ], 200);
    }
}

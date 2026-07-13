<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Http\Requests\Candidate\AttachCandidateSkillRequest;
use App\Http\Requests\Candidate\UpdateAttachCandidateSkillRequest;
use App\Http\Resources\SkillResource;
use App\Models\CandidateProfile;
use App\Models\Skill;
use Illuminate\Http\Request;

class CandidateSkillController extends Controller
{
    public function index(Request $request)
    {
        $profile = CandidateProfile::where('user_id', $request->user()->id)->firstOrFail();

        return SkillResource::collection(
            $profile->skills()
                ->orderBy('skill_name')
                ->paginate(10)
        )->additional([
                    'success' => true,
                    'message' => 'Skills retrieved successfully'
                ]);
    }

    public function store(AttachCandidateSkillRequest $request)
    {
        $profile = CandidateProfile::where('user_id', $request->user()->id)->firstOrFail();

        $profile->skills()->syncWithoutDetaching([
            $request->validated('skill_id') => [
                'proficiency_level' => $request->validated('proficiency_level', 'Intermediate'),
            ],
        ]);

        $profile->recalculateCompletion();
        $skill = $profile->skills()->whereKey($request->validated('skill_id'))->first();


        return response()->json([
            'success' => true,
            'message' => 'Skill attached successfully.',
            'data' => new SkillResource($skill),
        ], 201);
    }

    public function update(UpdateAttachCandidateSkillRequest $request, Skill $skill)
    {
        $profile = CandidateProfile::where('user_id', $request->user()->id)->firstOrFail();

        $updated = $profile->skills()->updateExistingPivot(
            $skill->id,
            [
                'proficiency_level' => $request->validated('proficiency_level'),
            ]
        );

        if ($updated === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Skill is not attached to your profile',
            ], 404);
        }

        $profile->recalculateCompletion();

        $skill = $profile->skills()
            ->whereKey($skill->id)
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Skill proficiency updated successfully.',
            'data' => new SkillResource($skill),
        ]);
    }

    public function destroy(Request $request, Skill $skill)
    {
        $profile = CandidateProfile::where('user_id', $request->user()->id)->firstOrFail();

        $detached = $profile->skills()->detach($skill->id);

        if ($detached === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Skill is not attached to your profile',
            ], 404);
        }

        $profile->recalculateCompletion();

        return response()->json([
            'success' => true,
            'message' => 'Skill removed successfully',
        ], 200);
    }
}

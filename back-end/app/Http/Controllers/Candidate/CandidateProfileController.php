<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Http\Requests\Candidate\StoreCandidateProfileRequest;
use App\Http\Requests\Candidate\UpdateCandidateProfileRequest;
use App\Http\Resources\CandidateProfileResource;
use App\Models\CandidateProfile;
use Illuminate\Http\Request;

class CandidateProfileController extends Controller
{
    public function index(Request $request)
    {
        $profiles = CandidateProfile::with(['skills'])
            ->paginate(10);

        return CandidateProfileResource::collection($profiles);
    }

    public function show(Request $request)
    {
        $profile = CandidateProfile::with([
            'skills',
            'resumes',
        ])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return CandidateProfileResource::make($profile);
    }

    public function store(StoreCandidateProfileRequest $request)
    {
        $profile = CandidateProfile::firstOrNew([
            'user_id' => $request->user()->id
        ]);
        $profile->fill($request->validated());
        $profile->save();
        $profile->recalculateCompletion();

        return CandidateProfileResource::make($profile->fresh([
            'skills',
            'resumes'
        ]))
            ->response()
            ->setStatusCode(201);
    }
    public function update(UpdateCandidateProfileRequest $request)
    {
        $profile = CandidateProfile::where('user_id', $request->user()->id)->firstOrFail();
        $profile->update($request->validated());
        $profile->recalculateCompletion();

        return CandidateProfileResource::make($profile->fresh(['skills', 'resumes']));
    }

}

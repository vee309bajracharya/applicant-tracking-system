<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Http\Requests\Candidate\StoreResumeRequest;
use App\Http\Resources\ResumeResource;
use App\Models\CandidateProfile;
use App\Models\Resume;
use App\Services\ResumeTextExtractionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ResumeController extends Controller
{
    public function __construct(protected ResumeTextExtractionService $extractor)
    {
    }

    public function index(Request $request)
    {
        $profile = CandidateProfile::where('user_id', $request->user()->id)->firstOrFail();

        return ResumeResource::collection($profile->resumes()->latest()->paginate(10));
    }

    public function store(StoreResumeRequest $request)
    {
        $profile = CandidateProfile::where('user_id', $request->user()->id)->firstOrFail();
        $file = $request->file('resume');
        $extension = $file->getClientOriginalExtension();
        $uuidName = Str::uuid() . '.' . $extension;
        $path = $file->storeAs('resumes', $uuidName, 'local'); // storage/app/resumes — private disk

        $isPrimary = $request->boolean('is_primary', false);
        if ($isPrimary)
            $profile->resumes()->update(['is_primary' => false]);

        //  plaintext extraction — feeds MatchScoreService's
        // keyword_score/tfidf_score. Never blocks the upload if it fails/returns null.
        $extractedText = $this->extractor->extract(Storage::disk('local')->path($path), $extension);

        $resume = $profile->resumes()->create([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'extracted_text' => $extractedText,
            'is_primary' => $isPrimary,
            'uploaded_at' => now(),
        ]);

        return ResumeResource::make($resume)->response()->setStatusCode(201);
    }

    public function destroy(Request $request, Resume $resume)
    {
        $this->authorizeOwnerOrGate($request, $resume);

        Storage::disk('local')->delete($resume->file_path);
        $resume->delete();
        return response()->json([
            'success' => true,
            'message' => 'Resume deleted successfully',
        ], 200);
    }

    public function download(Request $request, Resume $resume)
    {
        $this->authorizeOwnerOrGate($request, $resume);

        if (!Storage::disk('local')->exists($resume->file_path))
            abort(404, 'File not found');

        return response()->download(Storage::disk('local')->path($resume->file_path), $resume->file_name);

    }

    private function authorizeOwnerOrGate(Request $request, Resume $resume): void
    {
        $isOwner = $resume->candidateProfile->user_id === $request->user()->id;
        $hasStaffAccess = $request->user()->can('resumes.view');

        abort_unless($isOwner || $hasStaffAccess, 403, 'Unauthorized access to resume');
    }
}

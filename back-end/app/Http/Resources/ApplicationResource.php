<?php

namespace App\Http\Resources;

use App\Http\Resources\ApplicationStatusHistoryResource;
use App\Http\Resources\CandidateProfileResource;
use App\Http\Resources\JobResource;
use App\Http\Resources\ResumeResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'job_id' => $this->job_id,
            'job' => JobResource::make($this->whenLoaded('job')),

            'candidate_id' => $this->candidate_id,
            'candidate_profile' => CandidateProfileResource::make($this->whenLoaded('candidateProfile')),

            'resume_id' => $this->resume_id,
            'resume' => ResumeResource::make($this->whenLoaded('resume')),

            'status' => $this->status,
            'status_history' => ApplicationStatusHistoryResource::collection($this->whenLoaded('statusHistory')),

            'match_score' => MatchScoreResource::make($this->whenLoaded('matchScore')),

            'applied_at' => $this->applied_at,
            'created_at' => $this->created_at,
        ];
    }
}

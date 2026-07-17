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
            'job' => JobResource::make($this->whenLoaded('job')),
            'candidate_profile' => CandidateProfileResource::make($this->whenLoaded('candidateProfile')),
            'resume' => ResumeResource::make($this->whenLoaded('resume')),
            'status' => $this->status,
            'status_history' => ApplicationStatusHistoryResource::collection($this->whenLoaded('statusHistory')),
            'applied_at' => $this->applied_at,
            'created_at' => $this->created_at,
        ];
    }
}

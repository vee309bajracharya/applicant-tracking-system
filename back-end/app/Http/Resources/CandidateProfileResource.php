<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CandidateProfileResource extends JsonResource
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
            'user_id' => $this->user_id,
            'fullname' => $this->whenLoaded('user', fn() => $this->user->fullname),
            'headline' => $this->headline,
            'summary' => $this->summary,
            'experience_years' => (float) $this->experience_years,
            'expected_salary' => $this->expected_salary !== null ? (float) $this->expected_salary : null,
            'linkedin_url' => $this->linkedin_url,
            'github_url' => $this->github_url,
            'portfolio_url' => $this->portfolio_url,
            'profile_completion_percentage' => $this->profile_completion_percentage,
            'skills' => SkillResource::collection($this->whenLoaded('skills')),
            'resumes' => ResumeResource::collection($this->whenLoaded('resumes')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

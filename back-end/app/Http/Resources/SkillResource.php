<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SkillResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'skill_id' => $this->id,
            'skill_name' => $this->skill_name,
            'proficiency_level' => $this->when(
                isset($this->candidate_skill),
                fn() => $this->candidate_skill->proficiency_level
            ),
            'importance' => $this->when(
                isset($this->job_skill),
                fn() => $this->job_skill->importance
            ),
        ];
    }
}

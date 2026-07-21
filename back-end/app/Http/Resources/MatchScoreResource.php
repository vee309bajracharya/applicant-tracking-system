<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MatchScoreResource extends JsonResource
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
            'application_id' => $this->application_id,
            'skill_score' => (float) $this->skill_score,
            'experience_score' => (float) $this->experience_score,
            'keyword_score' => (float) $this->keyword_score,
            'tfidf_score' => (float) $this->tfidf_score,
            'final_score' => (float) $this->final_score,
            'matching_reason' => $this->matching_reason,
            'generated_at' => $this->generated_at,
        ];
    }
}

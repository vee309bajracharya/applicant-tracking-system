<?php

namespace App\Http\Resources;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InterviewFeedbackResource extends JsonResource
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
            'interview_id' => $this->interview_id,
            'reviewer_id' => $this->reviewer_id,
            'reviewer'=> UserResource::make($this->whenLoaded('reviewer')),
            'rating_score' => $this->rating_score,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
        ];
    }
}

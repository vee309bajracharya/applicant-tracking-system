<?php

namespace App\Http\Resources;

use App\Http\Resources\InterviewFeedbackResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InterviewResource extends JsonResource
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
            'recruiter_id' => $this->recruiter_id,
            'recruiter' => UserResource::make($this->whenLoaded('recruiter')),
            'interview_date' => optional($this->interview_date)->format('Y-m-d'),
            'interview_type' => $this->interview_type,
            'meeting_link' => $this->meeting_link,
            'status' => $this->status,
            'feedback' => InterviewFeedbackResource::collection($this->whenLoaded('feedback')),
            'created_at' => $this->created_at,
        ];

    }
}

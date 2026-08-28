<?php

namespace App\Http\Resources;

use App\Http\Resources\CompanyResource;
use App\Http\Resources\DepartmentResource;
use App\Http\Resources\SkillResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
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
            'title' => $this->title,
            'employment_type' => $this->employment_type,
            'location' => $this->location,
            'experience_required' => (float) $this->experience_required,
            'salary_min' => $this->salary_min !== null ? (float) $this->salary_min : null,
            'salary_max' => $this->salary_max !== null ? (float) $this->salary_max : null,
            'description' => $this->description,
            'status' => $this->status,
            'deadline' => optional($this->deadline)->format('Y-m-d'),
            'is_expiring_soon' => $this->resource->isExpiringSoon(),

            'company_id' => $this->company_id,
            'company' => CompanyResource::make($this->whenLoaded('company')),
            'department_id' => $this->department_id,
            'department' => DepartmentResource::make($this->whenLoaded('department')),
            'creator' => UserResource::make($this->whenLoaded('creator')),
            'skills' => SkillResource::collection($this->whenLoaded('skills')),

            'applications_count' => $this->whenCounted('applications'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyDetailResource extends JsonResource
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
            'company_name' => $this->company_name,
            'website' => $this->website,
            'email' => $this->email,
            'phone' => $this->phone,
            'logo' => $this->logo,
            'description' => $this->description,
            'departments' => DepartmentResource::collection($this->whenLoaded('departments')),
            'users' => UserResource::collection($this->whenLoaded('users')),
        ];
    }
}

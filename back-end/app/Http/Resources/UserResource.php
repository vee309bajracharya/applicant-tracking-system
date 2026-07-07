<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'fullname' => $this->fullname,
            'email' => $this->email,
            'phone' => $this->phone,
            'profile_photo' => $this->profile_photo,
            'status' => $this->status,
            'role' => $this->roles->first()?->name,
            'designation' => $this->whenPivotLoaded(
                'company_users',
                fn() => $this->company_user->designation
            ),
            'joined_at' => $this->whenPivotLoaded(
                'company_users',
                fn() => optional($this->company_user->joined_at)->format('Y-m-d')
            ),
        ];
    }
}

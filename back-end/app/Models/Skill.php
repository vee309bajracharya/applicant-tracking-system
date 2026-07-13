<?php

namespace App\Models;

use App\Models\CandidateProfile;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Skill extends Model
{
    use HasFactory;

    protected $fillable = ['skill_name'];

    public function candidateProfiles(): BelongsToMany
    {
        return $this->belongsToMany(CandidateProfile::class, 'candidate_skills', 'skill_id', 'candidate_id')
            ->as('candidate_skill')
            ->withPivot('proficiency_level');
    }
}

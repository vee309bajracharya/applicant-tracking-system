<?php

namespace App\Models;

use App\Models\Resume;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class CandidateProfile extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'user_id',
        'headline',
        'summary',
        'experience_years',
        'expected_salary',
        'linkedin_url',
        'github_url',
        'portfolio_url',
        'profile_completion_percentage',
    ];

    protected $casts = [
        'experience_years' => 'decimal:1',
        'expected_salary' => 'decimal:2',
        'profile_completion_percentage' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['headline', 'experience_years', 'expected_salary', 'profile_completion_percentage'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function resumes(): HasMany
    {
        return $this->hasMany(Resume::class, 'candidate_id');
        ;
    }

    public function primaryResume(): HasMany
    {
        return $this->hasMany(Resume::class, 'candidate_id')->where('is_primary', true);
    }

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'candidate_skills', 'candidate_id', 'skill_id')
            ->as('candidate_skill')
            ->withPivot('proficiency_level');
    }

    public function recalculateCompletion(): int
    {
        $baseFields = [$this->headline, $this->summary, $this->experience_years];
        $baseFilled = collect($baseFields)->filter(fn($v) => !empty($v))->count();
        $baseScore = ($baseFilled / count($baseFields)) * 70;

        $resumeScore = $this->resumes()->exists() ? 15 : 0;
        $skillScore = $this->skills()->exists() ? 15 : 0;

        $total = (int) round($baseScore + $resumeScore + $skillScore);
        $this->update(['profile_completion_percentage' => $total]);

        return $total;
    }
}

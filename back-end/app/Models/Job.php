<?php

namespace App\Models;

use App\Models\Application;
use App\Models\Company;
use App\Models\Department;
use App\Models\Skill;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Job extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'job_postings'; // table renamed to avoid collision with Laravel's queue 'jobs' table

    protected $fillable = [
        'company_id',
        'department_id',
        'created_by',
        'title',
        'employment_type',
        'location',
        'experience_required',
        'salary_min',
        'salary_max',
        'description',
        'status',
        'deadline',
    ];
    protected $casts = [
        'experience_required' => 'decimal:1',
        'salary_min' => 'decimal:2',
        'salary_max' => 'decimal:2',
        'deadline' => 'date',
    ];
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'status', 'deadline'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'job_skills', 'job_id', 'skill_id')
            ->as('job_skill')
            ->withPivot('importance');
    }

    public function requiredSkills(): BelongsToMany
    {
        return $this->skills()->wherePivot('importance', 'required');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class, 'job_id');
    }

    public function isExpiringSoon(): bool
    {
        if ($this->status !== 'open' || !$this->deadline)
            return false;
        $daysUntilDeadline = now()->diffInDays($this->deadline, false);
        return $daysUntilDeadline >= 0 && $daysUntilDeadline <= 5;
    }

}

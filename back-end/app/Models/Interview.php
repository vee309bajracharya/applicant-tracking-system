<?php

namespace App\Models;

use App\Models\Application;
use App\Models\InterviewFeedback;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Interview extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'application_id',
        'recruiter_id',
        'interview_date',
        'interview_type',
        'meeting_link',
        'status',
    ];

    protected $casts = [
        'interview_date' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['intervew_date', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class, 'application_id');
    }

    public function recruiter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recruiter_id');
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(InterviewFeedback::class, 'interview_id');
    }
}

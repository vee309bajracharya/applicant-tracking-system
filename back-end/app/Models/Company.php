<?php

namespace App\Models;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Company extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'company_name',
        'website',
        'email',
        'phone',
        'logo',
        'description',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['company_name', 'website', 'email', 'phone'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function departments(): HasMany
    {
        return $this->hasMany(Department::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'company_users')
            ->as('company_user')
            ->withPivot('designation', 'joined_at')
            ->withTimestamps();
    }
}

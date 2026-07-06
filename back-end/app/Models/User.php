<?php

namespace App\Models;

use App\Models\Company;
use App\Models\PasswordResetOtp;
use App\Models\SocialAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, LogsActivity, Notifiable, SoftDeletes;

    protected string $guard_name = 'sanctum';

    protected $fillable = [
        'fullname',
        'email',
        'password',
        'phone',
        'profile_photo',
        'status',
        'email_verified_at',
        'last_login_at'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'deleted_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // activity log
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['fullname', 'email', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // helpers
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isEmailVerified(): bool
    {
        return $this->email_verified_at !== null;
    }

    // relationships
    public function socialAccounts(): HasMany
    {
        return $this->hasMany(SocialAccount::class);
    }

    public function passwordResetOtps(): HasMany
    {
        return $this->hasMany(PasswordResetOtp::class, 'email', 'email');
    }

    public function companies(): BelongsToMany
    {
        return $this->belongsToMany(Company::class, 'company_users')
            ->as('company_user')
            ->withPivot('designation', 'joined_at')
            ->withTimestamps();
    }
}

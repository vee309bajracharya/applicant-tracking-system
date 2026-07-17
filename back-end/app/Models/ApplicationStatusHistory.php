<?php

namespace App\Models;

use App\Models\Application;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use RuntimeException;

class ApplicationStatusHistory extends Model
{
    use HasFactory;

    protected $table = 'application_status_history';

    public $timestamps = false;

    protected $fillable = [
        'application_id',
        'old_status',
        'new_status',
        'changed_by',
        'reason',
        'created_at',
    ];

    protected static function booted(): void
    {
        static::updating(fn() => throw new RuntimeException('Status history records are immutable'));
        static::deleting(fn() => throw new RuntimeException('Status history records are immutable'));
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}

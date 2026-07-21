<?php

namespace App\Models;

use App\Models\Application;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'skill_score',
        'experience_score',
        'keyword_score',
        'tfidf_score',
        'final_score',
        'matching_reason',
        'generated_at',
    ];

    protected $casts = [
        'skill_score' => 'decimal:2',
        'experience_score' => 'decimal:2',
        'keyword_score' => 'decimal:2',
        'tfidf_score' => 'decimal:2',
        'final_score' => 'decimal:2',
        'generated_at' => 'datetime',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class, 'application_id');
    }

}

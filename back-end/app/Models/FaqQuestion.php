<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FaqQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'question',
        'answer',
        'category',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}

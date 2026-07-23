<?php

namespace App\Models;

use App\Models\ChatbotConversation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatbotMessage extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'conversation_id',
        'sender',
        'message',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(ChatbotConversation::class, 'conversation_id');
    }
}

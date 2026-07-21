<?php

namespace App\Services;

use App\Mail\NotificationMail;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public function dispatch(int $userId, string $title, string $message): Notification
    {
        $notification = Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
        ]);

        $email = User::find($userId)?->email;

        if ($email) {
            try {
                Mail::to($email)->send(new NotificationMail($title, $message));
            } catch (\Throwable $e) {
                Log::warning('NotificationMail dispatch failed', [
                    'user_id' => $userId,
                    'notification_id' => $notification->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $notification;
    }
}

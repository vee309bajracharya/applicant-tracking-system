<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\OtpVerifyRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Mail\OtpMail;
use App\Models\PasswordResetOtp;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class PasswordResetController extends Controller
{
    // user submits email and receive OTP
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => [
                'required',
                'email',
                'max:255',
                'exists:users,email'
            ]
        ]);

        // invalidate existing active OTPs
        PasswordResetOtp::where('email', $request->email)->whereNull('verified_at')->delete();

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        PasswordResetOtp::create([
            'email' => $request->email,
            'otp' => $otp,
            'expires_at' => now()->addMinutes(10),
        ]);

        Mail::to($request->email)->send(new OtpMail($otp, 'Password Reset'));

        return response()->json([
            'success' => true,
            'message' => 'Password reset OTP sent. Check your email',
        ]);
    }

    // verify OTP -> receive reset_token
    public function verifyOtp(OtpVerifyRequest $request): JsonResponse
    {
        $record = PasswordResetOtp::where('email', $request->email)
            ->whereNull('verified_at')
            ->latest()
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'No pending OTP found for this email.',
            ], 404);
        }

        if ($record->isExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'OTP expired. Request a new one.',
            ], 422);
        }

        if ($record->hasExceededAttempts()) {
            return response()->json([
                'success' => false,
                'message' => 'Maximum attempts exceeded. Request a new OTP.',
            ], 429);
        }

        if ($record->otp !== $request->otp) {
            $record->increment('attempts');

            return response()->json([
                'success' => false,
                'message' => 'Incorrect OTP. Attempts remaining: ' . (5 - $record->attempts),
            ], 422);
        }

        // generate one-time cryptographic reset token
        $resetToken = bin2hex(random_bytes(32));

        $record->update([
            'verified_at' => now(),
            'reset_token' => $resetToken,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully. Use the reset token to reset your password.',
            'data' => [
                'reset_token' => $resetToken
            ]
        ], 200);
    }

    // submit reset token and new password
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $record = PasswordResetOtp::where('email', $request->email)
            ->where('reset_token', $request->reset_token)
            ->whereNotNull('verified_at')
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired reset token.',
            ], 422);
        }

        // reset token valid for 15mins after OTP verification
        if ($record->verified_at->addMinutes(15)->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Reset token expired. Request a new OTP.',
            ], 422);
        }

        User::where('email', $request->email)->update([
            'password' => Hash::make($request->password),
        ]);

        $record->delete(); // invalidate the reset token after successful password reset

        // revoke all existing tokens and force re-login
        User::where('email', $request->email)->first()?->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successful. Please login with your new password',
        ], 200);
    }


}

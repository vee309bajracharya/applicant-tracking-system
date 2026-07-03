<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\OtpVerifyRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Mail\OtpMail;
use App\Models\PasswordResetOtp;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller
{
    // register
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'fullname' => $request->fullname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'status' => 'active',
        ]);

        $user->assignRole('candidate'); // all self-registered users are candidates by default

        $this->sendOtp($user->email, 'Email Verification'); // send email verification OTP

        return response()->json([
            'success' => true,
            'message' => 'Registration successful. Check your email for the OTP Verification',
            'data' => [
                'user_id' => $user->id,
                'email' => $user->email,
            ]
        ], 201);
    }

    // login
    public function login(LoginRequest $request): JsonResponse
    {
        $key = 'login:' . $request->ip();

        // rate limiting: 5 attempts per 60sec
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'success' => false,
                'message' => "Too many login attempts. Please try again in {$seconds} seconds",
            ], 429);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($key, 60);
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        // check account status

        if ($user->status === 'suspended') {
            return response()->json([
                'success' => false,
                'message' => 'Account suspended. Please Contact administrator',
            ], 403);
        }

        if ($user->status === 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Account pending activation. Check your invitation email',
            ], 403);
        }

        // candidates must verify their email before login
        if ($user->hasRole('candidate') && !$user->isEmailVerified()) {
            return response()->json([
                'success' => false,
                'message' => 'Email not verified. Check your email for the OTP',
                'data' => [
                    'requires_verification' => true,
                    'email' => $user->email
                ],
            ], 403);
        }

        RateLimiter::clear($key); // clear rate limiter on successful login

        $user->update([
            'last_login_at' => now()
        ]);

        // revoke old tokens and create new token
        $user->tokens()->delete();
        $token = $user->createToken('ats-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'fullname' => $user->fullname,
                    'email' => $user->email,
                    'role' => $user->getRoleNames()->first(),
                    'status' => $user->status,
                ]
            ]
        ], 200);
    }

    // logout
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ], 200);
    }

    // authenticated user profile
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('socialAccounts');
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'fullname' => $user->fullname,
                'email' => $user->email,
                'phone' => $user->phone,
                'profile_photo' => $user->profile_photo,
                'status' => $user->status,
                'role' => $user->getRoleNames()->first(),
                'email_verified' => $user->isEmailVerified(),
                'last_login_at' => $user->last_login_at,
            ]
        ], 200);
    }

    // OTP Email verification

    public function verifyEmail(OtpVerifyRequest $request): JsonResponse
    {
        $record = PasswordResetOtp::where('email', $request->email)
            ->whereNull('verified_at')
            ->latest()
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'No OTP record found for this email',
            ], 404);
        }

        if ($record->isExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'OTP has expired. Please request a new OTP',
            ], 400);
        }

        if ($record->hasExceededAttempts()) {
            return response()->json([
                'success' => false,
                'message' => 'OTP verification attempts exceeded. Please request a new OTP',
            ], 429);
        }

        if ($record->otp !== $request->otp) {
            $record->increment('attempts');
            return response()->json([
                'success' => false,
                'message' => 'Incorrect OTP. Attempts remaining: ' . (5 - $record->attempts),
            ], 422);
        }

        // mark OTP as verified and update user's email_verified_at
        $record->update([
            'verified_at' => now()
        ]);
        User::where('email', $request->email)->update([
            'email_verified_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully. Proceed to Login',
        ], 200);
    }

    // resend OTP for email verification
    public function resendVerificationOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => [
                'required',
                'email',
                'max:100',
                'exists:users,email'
            ]
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->isEmailVerified()) {
            return response()->json([
                'success' => false,
                'message' => 'Email is already verified. Please proceed to login',
            ], 422);
        }

        $this->sendOtp($user->email, 'Email Verification');

        return response()->json([
            'success' => true,
            'message' => 'OTP resent successfully. Check your email for the OTP',
        ], 200);
    }

    // private OTP Generator
    private function sendOtp(string $email, string $purpose): void
    {
        PasswordResetOtp::where('email', $email)->whereNull('verified_at')->delete(); // delete any previous unverified OTPs

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        PasswordResetOtp::create([
            'email' => $email,
            'otp' => $otp,
            'expires_at' => now()->addMinutes(10),
        ]);

        Mail::to($email)->send(new OtpMail($otp, $purpose));
    }

}

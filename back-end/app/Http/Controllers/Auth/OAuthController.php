<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    // URL Slugs accepted in routes
    private array $allowedProviders = ['google'];

    // redirect to provider
    public function redirect(string $provider): RedirectResponse|JsonResponse
    {
        if (!in_array($provider, $this->allowedProviders)) {
            return response()->json([
                'success' => false,
                'message' => 'Unsupported OAuth provider',
            ], 422);
        }
        return Socialite::driver('google')->stateless()->redirect();
    }

    // handle provider callback
    public function callback(string $provider): JsonResponse
    {
        if (!in_array($provider, $this->allowedProviders)) {
            return response()->json([
                'success' => false,
                'message' => 'Unsupported OAuth provider',
            ], 422);
        }

        try {
            $socialUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'OAuth authentication failed. Please try again',
            ], 401);
        }

        // check if social account already linked to a user
        $existingSocial = SocialAccount::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();
        if ($existingSocial) {
            $user = $existingSocial->user;
        } else {
            // check if email already registered
            $user = User::where('email', $socialUser->getEmail())->first();

            if (!$user) {
                // auto-register new candidate
                $user = User::create([
                    'fullname' => $socialUser->getName() ?? $socialUser->getEmail(),
                    'email' => $socialUser->getEmail(),
                    'password' => null,
                    'status' => 'active',
                    'email_verified_at' => now(), // OAuth = implicitly verified
                    'profile_photo' => $socialUser->getAvatar(),
                ]);

                $user->assignRole('candidate');
            }

            // link provider account
            SocialAccount::create([
                'user_id' => $user->id,
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'provider_email' => $socialUser->getEmail(),
            ]);
        }

        if ($user->status === 'suspended') {
            return response()->json([
                'success' => false,
                'message' => 'Account suspended. Contact administrator',
            ], 403);
        }

        $user->update([
            'last_login_at' => now()
        ]);

        $user->tokens()->delete();
        $token = $user->createToken('ats-oauth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'OAuth Login Successful.',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'fullname' => $user->fullname,
                    'email' => $user->email,
                    'role' => $user->getRoleNames()->first(),
                    'status' => $user->status,
                ],
            ],
        ], 200);
    }

}

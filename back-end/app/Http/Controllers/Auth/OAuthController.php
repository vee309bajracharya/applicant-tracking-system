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
    public function redirect(string $provider): RedirectResponse
    {
        if (!in_array($provider, $this->allowedProviders)) {
            return $this->redirectToFrontendWithError('Unsupported OAuth provider');
        }

        return Socialite::driver('google')->stateless()->redirect();
    }

    // handle provider callback
    public function callback(string $provider): RedirectResponse
    {
        if (!in_array($provider, $this->allowedProviders)) {
            return $this->redirectToFrontendWithError('Unsupported OAuth provider');
        }

        try {
            $socialUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return $this->redirectToFrontendWithError('OAuth authentication failed. Please try again');
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
            return $this->redirectToFrontendWithError('Account suspended. Contact administrator');
        }

        $user->update(['last_login_at' => now()]);

        $user->tokens()->delete();
        $token = $user->createToken('ats-oauth-token')->plainTextToken;

        return $this->redirectToFrontendWithSession($token, $user);
    }

    // success: hand the token/user off to the SPA via URL fragment.
    private function redirectToFrontendWithSession(string $token, User $user): RedirectResponse
    {
        $payload = http_build_query([
            'token' => $token,
            'id' => $user->id,
            'fullname' => $user->fullname,
            'email' => $user->email,
            'role' => $user->getRoleNames()->first(),
            'status' => $user->status,
        ]);

        return redirect()->away(
            rtrim(config('app.frontend_url'), '/') . '/oauth/callback#' . $payload
        );
    }

    // fail: send the user back to login with a readable error in the query string
    private function redirectToFrontendWithError(string $message): RedirectResponse
    {
        return redirect()->away(
            rtrim(config('app.frontend_url'), '/') . '/login?oauth_error=' . urlencode($message)
        );
    }

}

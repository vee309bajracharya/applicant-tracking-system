<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailVerified
{
    /**
     * Candidates must verify email before accessing protected routes.
     * HR Managers and Recruiters are provisioned by Admin
     * so their accounts are pre-verified.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->hasRole('candidate') && !$user->isEmailVerified()) {
            return response()->json([
                'success' => false,
                'message' => 'Email not verified. Check your mail for the OTP',
                'data' => [
                    'requires_verification' => true,
                    'email' => $user->email,
                ]
            ], 403);
        }
        return $next($request);
    }
}

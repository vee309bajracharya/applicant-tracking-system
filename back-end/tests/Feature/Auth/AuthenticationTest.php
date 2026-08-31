<?php

use App\Models\PasswordResetOtp;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

/*
|--------------------------------------------------------------------------
| 7.1 Candidate Registration
|--------------------------------------------------------------------------
| WHO:  a guest, nobody yet.
| WHAT: POST /auth/register.
| WHY:  self-registration must always land as 'candidate' — this is the
|       only role the public endpoint is allowed to grant. It must also
|       leave the account unverified and kick off the OTP email, because
|       login is blocked for unverified candidates.
*/
it('registers a candidate and assigns the candidate role', function () {
    // ACT
    $response = $this->postJson('/api/v1/auth/register', [
        'fullname' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'Str0ng!Passw0rd',
    ]);

    // ASSERT — response shape
    $response
        ->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.email', 'jane@example.com');

    // ASSERT — database side effects. A 201 alone doesn't prove the role
    // was assigned or that verification is still required.
    $user = User::where('email', 'jane@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->hasRole('candidate'))->toBeTrue()
        ->and($user->email_verified_at)->toBeNull();

    // ASSERT — the verification email was actually attempted.
    Mail::assertSentCount(1);

    // ASSERT — an OTP record now exists to back that email.
    expect(
        PasswordResetOtp::where('email', 'jane@example.com')->count()
    )->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Invalid Registration
|--------------------------------------------------------------------------
| WHY: protects RegisterRequest's rules. Empty fullname, malformed email,
|      and a password that fails Password::min(8)->letters()->mixedCase()
|      ->numbers()->symbols() must all be caught before anything is
|      written to the database.
*/
it('rejects invalid registration data', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'fullname' => '',
        'email' => 'not-an-email',
        'password' => 'weak',
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['fullname', 'email', 'password']);
});

/*
|--------------------------------------------------------------------------
|  Duplicate Email
|--------------------------------------------------------------------------
| HOW: the first user is the ARRANGE step (precondition). The second
|      registration attempt is the ACT. The validation error is the ASSERT.
*/
it('rejects a duplicate email address', function () {
    // ARRANGE
    User::factory()->create([
        'email' => 'existing@example.com',
    ]);

    // ACT
    $response = $this->postJson('/api/v1/auth/register', [
        'fullname' => 'Another User',
        'email' => 'existing@example.com',
        'password' => 'Str0ng!Passw0rd',
    ]);

    // ASSERT
    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

/*
|--------------------------------------------------------------------------
| Successful Login
|--------------------------------------------------------------------------
| WHY: 200 OK alone doesn't prove authentication actually completed — the
|      contract is that a Sanctum token gets issued. We check both the
|      response body AND that the token string is non-empty.
*/
it('logs in a verified candidate and issues a token', function () {
    // ARRANGE — an already-verified candidate.
    $user = User::factory()->create([
        'email' => 'jane@example.com',
        'password' => Hash::make('Str0ng!Passw0rd'),
        'email_verified_at' => now(),
    ]);
    $user->assignRole('candidate');

    // ACT
    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'jane@example.com',
        'password' => 'Str0ng!Passw0rd',
    ]);

    // ASSERT
    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.user.email', 'jane@example.com')
        ->assertJsonPath('data.user.role', 'candidate');

    expect($response->json('data.token'))
        ->toBeString()
        ->not->toBeEmpty();
});

/*
|--------------------------------------------------------------------------
| Invalid Credentials
|--------------------------------------------------------------------------
| WHY: protects the authentication boundary itself — correct email, wrong
|      password must never authenticate, regardless of account status.
*/
it('rejects login with an incorrect password', function () {
    User::factory()->create([
        'email' => 'jane@example.com',
        'password' => Hash::make('Str0ng!Passw0rd'),
        'email_verified_at' => now(),
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'jane@example.com',
        'password' => 'WrongPassword1!',
    ]);

    $response->assertUnauthorized();
});

/*
|--------------------------------------------------------------------------
| Unverified Candidate
|--------------------------------------------------------------------------
| WHY: candidates specifically are gated on email_verified_at. Staff roles
|      are NOT subject to this check (see AuthController::login — the
|      condition is scoped to hasRole('candidate')).
*/
it('blocks login for a candidate whose email is not verified', function () {
    $user = User::factory()->create([
        'email' => 'jane@example.com',
        'password' => Hash::make('Str0ng!Passw0rd'),
        'email_verified_at' => null,
    ]);
    $user->assignRole('candidate');

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'jane@example.com',
        'password' => 'Str0ng!Passw0rd',
    ]);

    $response
        ->assertForbidden()
        ->assertJsonPath('data.requires_verification', true);
});

/*
|--------------------------------------------------------------------------
|  Suspended Account
|--------------------------------------------------------------------------
| WHY: a correct password must not be enough — suspension blocks login
|      even when credentials are fully valid.
*/
it('blocks login for a suspended account even with the correct password', function () {
    $user = User::factory()->create([
        'email' => 'jane@example.com',
        'password' => Hash::make('Str0ng!Passw0rd'),
        'email_verified_at' => now(),
        'status' => 'suspended',
    ]);
    $user->assignRole('candidate');

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'jane@example.com',
        'password' => 'Str0ng!Passw0rd',
    ]);

    $response->assertForbidden();
});

/*
|--------------------------------------------------------------------------
| Pending Account
|--------------------------------------------------------------------------
| WHY: relevant specifically to invited HR Manager / Recruiter accounts —
|      they exist in the users table before they ever set a password, and
|      must not be able to log in during that window.
*/
it('blocks login for a pending account', function () {
    $user = User::factory()->create([
        'email' => 'pending.hr@example.com',
        'password' => Hash::make('Str0ng!Passw0rd'),
        'email_verified_at' => now(),
        'status' => 'pending',
    ]);
    $user->assignRole('hr_manager');

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'pending.hr@example.com',
        'password' => 'Str0ng!Passw0rd',
    ]);

    $response->assertForbidden();
});

/*
|--------------------------------------------------------------------------
| Login Rate Limiting
|--------------------------------------------------------------------------
| WHY: this is a security feature (brute-force mitigation), not incidental
|      behavior — it deserves its own regression test, separate from the
|      "wrong password = 401" test above.
| HOW:  the limiter key is 'login:' . $request->ip() — since Pest's test
|       client hits the app from the same fake IP every request, 5 failed
|       attempts against the SAME endpoint accumulate against that key.
*/
it('rate limits login after 5 failed attempts within 60 seconds', function () {
    User::factory()->create([
        'email' => 'jane@example.com',
        'password' => Hash::make('Str0ng!Passw0rd'),
        'email_verified_at' => now(),
    ]);

    foreach (range(1, 5) as $attempt) {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'jane@example.com',
            'password' => 'WrongPassword1!',
        ])->assertUnauthorized();
    }

    // 6th attempt within the window — limiter kicks in regardless of
    // whether the password would have been correct this time.
    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'jane@example.com',
        'password' => 'Str0ng!Passw0rd',
    ]);

    $response->assertTooManyRequests();
});

it('clears the rate limiter on a successful login', function () {
    $user = User::factory()->create([
        'email' => 'jane@example.com',
        'password' => Hash::make('Str0ng!Passw0rd'),
        'email_verified_at' => now(),
    ]);
    $user->assignRole('candidate');

    // Two failed attempts, then one success — the successful login calls
    // RateLimiter::clear(), so a subsequent failed attempt should start
    // counting from zero again rather than continuing at 3/5.
    $this->postJson('/api/v1/auth/login', ['email' => 'jane@example.com', 'password' => 'WrongPass123!'])->assertUnauthorized();
    $this->postJson('/api/v1/auth/login', ['email' => 'jane@example.com', 'password' => 'WrongPass456!'])->assertUnauthorized();
    $this->postJson('/api/v1/auth/login', ['email' => 'jane@example.com', 'password' => 'Str0ng!Passw0rd'])->assertOk();

    expect(RateLimiter::attempts('login:127.0.0.1'))->toBe(0);
});

/*
|--------------------------------------------------------------------------
|  /auth/me — and why actingAs()
|--------------------------------------------------------------------------
| We already proved login issues a real token in 7.4. For every OTHER test
| that just needs "some authenticated user", re-running the full login
| flow would be testing the same dependency repeatedly. actingAs($user,
| 'sanctum') tells Laravel to treat the request as already authenticated
| through the sanctum guard, so the test can focus on its actual subject.
*/
it('rejects /auth/me when unauthenticated', function () {
    $this->getJson('/api/v1/auth/me')
        ->assertUnauthorized();
});

it('returns the authenticated user\'s own profile on /auth/me', function () {
    $user = User::factory()->create(['email' => 'jane@example.com']);
    $user->assignRole('candidate');

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/auth/me');

    $response
        ->assertOk()
        ->assertJsonPath('data.email', 'jane@example.com')
        ->assertJsonPath('data.role', 'candidate');
});

/*
|--------------------------------------------------------------------------
| 7.12 Profile Update
|--------------------------------------------------------------------------
| WHY: password changes on this endpoint are gated behind the CURRENT
|      password, not just the new one — this protects against a hijacked
|      session silently taking over the account's credentials.
*/
it('updates the authenticated user\'s profile fields', function () {
    $user = User::factory()->create(['fullname' => 'Old Name']);
    $user->assignRole('candidate');

    $response = $this->actingAs($user, 'sanctum')->patchJson('/api/v1/auth/me', [
        'fullname' => 'New Name',
    ]);

    $response->assertOk();
    expect($user->fresh()->fullname)->toBe('New Name');
});

it('changes the password when the correct current password is supplied', function () {
    $user = User::factory()->create(['password' => Hash::make('OldPass1!')]);
    $user->assignRole('candidate');

    $response = $this->actingAs($user, 'sanctum')->patchJson('/api/v1/auth/me', [
        'current_password' => 'OldPass1!',
        'password' => 'NewPass1!',
        'password_confirmation' => 'NewPass1!',
    ]);

    $response->assertOk();
    expect(Hash::check('NewPass1!', $user->fresh()->password))->toBeTrue();
});

it('rejects a password change when the current password is wrong', function () {
    $user = User::factory()->create(['password' => Hash::make('OldPass1!')]);
    $user->assignRole('candidate');

    $response = $this->actingAs($user, 'sanctum')->patchJson('/api/v1/auth/me', [
        'current_password' => 'WrongOldPass1!',
        'password' => 'NewPass1!',
        'password_confirmation' => 'NewPass1!',
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['current_password']);
    expect(Hash::check('OldPass1!', $user->fresh()->password))->toBeTrue();
});

/*
|--------------------------------------------------------------------------
|  Logout
|--------------------------------------------------------------------------
| WHY: a success message alone does not prove the token was revoked. We
|      verify the actual database state — the token row must be gone,
|      not just that the endpoint replied nicely.
*/
it('logs out and revokes the current access token', function () {
    $user = User::factory()->create();
    $user->assignRole('candidate');
    $token = $user->createToken('test-token');

    $response = $this->withToken($token->plainTextToken)
        ->postJson('/api/v1/auth/logout');

    $response->assertOk();
    expect($user->tokens()->count())->toBe(0);
});

/*
|--------------------------------------------------------------------------
|  Email Verification
|--------------------------------------------------------------------------
| WHY: this checks BOTH sides of the verification record — the user row
|      must flip to verified, AND the OTP row itself must record when it
|      was verified (used elsewhere to prevent OTP reuse).
*/
it('verifies a candidate\'s email with a correct OTP', function () {
    $user = User::factory()->create(['email' => 'jane@example.com', 'email_verified_at' => null]);
    $user->assignRole('candidate');

    $otp = PasswordResetOtp::create([
        'email' => $user->email,
        'otp' => '123456',
        'expires_at' => now()->addMinutes(10),
    ]);

    $response = $this->postJson('/api/v1/auth/verify-email', [
        'email' => 'jane@example.com',
        'otp' => '123456',
    ]);

    $response->assertOk();
    expect($user->fresh()->email_verified_at)->not->toBeNull();
    expect($otp->fresh()->verified_at)->not->toBeNull();
});

/*
|--------------------------------------------------------------------------
|  Invalid OTP
|--------------------------------------------------------------------------
| WHY: the controller also tracks attempts and decrements a remaining
|      count in the message — worth confirming the attempt counter
|      actually increments, since that's what eventually locks the OTP
|      out after 5 tries.
*/
it('rejects an incorrect OTP and increments the attempt counter', function () {
    $user = User::factory()->create(['email' => 'jane@example.com', 'email_verified_at' => null]);
    $user->assignRole('candidate');

    $otp = PasswordResetOtp::create([
        'email' => $user->email,
        'otp' => '123456',
        'expires_at' => now()->addMinutes(10),
    ]);

    $response = $this->postJson('/api/v1/auth/verify-email', [
        'email' => 'jane@example.com',
        'otp' => '999999',
    ]);

    $response->assertUnprocessable();
    expect($otp->fresh()->attempts)->toBe(1);
    expect($user->fresh()->email_verified_at)->toBeNull();
});

/*
|--------------------------------------------------------------------------
| Resend Verification OTP
|--------------------------------------------------------------------------
*/
it('resends a verification OTP and deletes the previous unverified one', function () {
    $user = User::factory()->create(['email' => 'jane@example.com', 'email_verified_at' => null]);
    $user->assignRole('candidate');

    $originalOtp = PasswordResetOtp::create([
        'email' => $user->email,
        'otp' => '111111',
        'expires_at' => now()->addMinutes(10),
    ]);

    $response = $this->postJson('/api/v1/auth/resend-verification-otp', [
        'email' => 'jane@example.com',
    ]);

    $response->assertOk();
    expect(PasswordResetOtp::find($originalOtp->id))->toBeNull();
    expect(PasswordResetOtp::where('email', 'jane@example.com')->whereNull('verified_at')->count())->toBe(1);
    Mail::assertSentCount(1);
});

it('rejects resending an OTP for an already-verified email', function () {
    $user = User::factory()->create(['email' => 'jane@example.com', 'email_verified_at' => now()]);
    $user->assignRole('candidate');

    $response = $this->postJson('/api/v1/auth/resend-verification-otp', [
        'email' => 'jane@example.com',
    ]);

    $response->assertUnprocessable();
});

/*
|--------------------------------------------------------------------------
|  Password Reset Flow (3-step OTP)
|--------------------------------------------------------------------------
| forgot -> OTP generated
| verify -> reset_token generated (64 hex chars, per §7.18)
| reset  -> password changed + ALL existing Sanctum tokens revoked
*/
it('sends a password reset OTP for a known email', function () {
    User::factory()->create(['email' => 'jane@example.com']);

    $response = $this->postJson('/api/v1/auth/password/forgot', [
        'email' => 'jane@example.com',
    ]);

    $response->assertOk();
    expect(PasswordResetOtp::where('email', 'jane@example.com')->count())->toBe(1);
    Mail::assertSentCount(1);
});

it('issues a 64-character reset token after correct OTP verification', function () {
    User::factory()->create(['email' => 'jane@example.com']);
    PasswordResetOtp::create([
        'email' => 'jane@example.com',
        'otp' => '123456',
        'expires_at' => now()->addMinutes(10),
    ]);

    $response = $this->postJson('/api/v1/auth/password/verify', [
        'email' => 'jane@example.com',
        'otp' => '123456',
    ]);

    $response->assertOk();
    // bin2hex(random_bytes(32)) => 32 bytes * 2 hex chars = 64 chars.
    // This documents the current implementation's contract.
    expect($response->json('data.reset_token'))
        ->toBeString()
        ->toHaveLength(64);
});

it('rejects an invalid or expired reset token on the final reset step', function () {
    User::factory()->create(['email' => 'jane@example.com', 'password' => Hash::make('OldPass1!')]);

    $response = $this->postJson('/api/v1/auth/password/reset', [
        'email' => 'jane@example.com',
        'reset_token' => str_repeat('a', 64),
        'password' => 'NewPass1!',
        'password_confirmation' => 'NewPass1!',
    ]);

    $response->assertUnprocessable();
});

it('resets the password and revokes all existing tokens', function () {
    $user = User::factory()->create(['email' => 'jane@example.com', 'password' => Hash::make('OldPass1!')]);
    $user->assignRole('candidate');
    $user->createToken('old-session-1');
    $user->createToken('old-session-2');

    $otp = PasswordResetOtp::create([
        'email' => 'jane@example.com',
        'otp' => '123456',
        'expires_at' => now()->addMinutes(10),
        'verified_at' => now(),
        'reset_token' => str_repeat('b', 64),
    ]);

    $response = $this->postJson('/api/v1/auth/password/reset', [
        'email' => 'jane@example.com',
        'reset_token' => str_repeat('b', 64),
        'password' => 'NewPass1!',
        'password_confirmation' => 'NewPass1!',
    ]);

    $response->assertOk();
    expect(Hash::check('NewPass1!', $user->fresh()->password))->toBeTrue();
    expect($user->fresh()->tokens()->count())->toBe(0);
    expect(PasswordResetOtp::find($otp->id))->toBeNull();
});

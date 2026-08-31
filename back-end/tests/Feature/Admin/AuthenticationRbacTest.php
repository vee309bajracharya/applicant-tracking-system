<?php

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

// Admin Route Protection
it('rejects an unauthenticated request to an admin-only route', function () {
    $this->getJson('/api/v1/admin/users')->assertUnauthorized();
});

it('allows an admin to reach an admin-only route', function () {
    $admin = adminUser();
    $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/users')->assertOk();
});

it('blocks a candidate from an admin-only route', function () {
    $candidate = candidateUser();
    $this->actingAs($candidate, 'sanctum')->getJson('/api/v1/admin/users')->assertForbidden();
});

it('blocks a recruiter from an admin-only route', function () {
    $recruiter = recruiterUser();
    $this->actingAs($recruiter, 'sanctum')->getJson('/api/v1/admin/users')->assertForbidden();
});

it('blocks an hr manager from an admin-only route', function () {
    $hr = hrManagerUser();
    $this->actingAs($hr, 'sanctum')->getJson('/api/v1/admin/users')->assertForbidden();
});

// Admin Invitation
it('lets an admin invite a new HR Manager', function () {
    $admin = adminUser();

    $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/invite', [
        'fullname' => 'New HR',
        'email' => 'new.hr@example.com',
        'role' => 'hr_manager',
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.status', 'pending');

    $user = User::where('email', 'new.hr@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->hasRole('hr_manager'))->toBeTrue()
        ->and($user->status)->toBe('pending')
        ->and($user->password)->toBeNull();

    Mail::assertSentCount(1);
});

/*
|--------------------------------------------------------------------------
| Invalid Invitation Role
|--------------------------------------------------------------------------
| WHY: this is the guard against privilege escalation through the invite
|      form itself — only hr_manager and recruiter are grantable here.
|      Neither 'candidate' (wrong direction — candidates self-register)
|      nor 'admin' (privilege escalation) may be requested.
*/
it('rejects an invitation for the candidate role', function () {
    $admin = adminUser();

    $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/invite', [
        'fullname' => 'Should Not Work',
        'email' => 'nope1@example.com',
        'role' => 'candidate',
    ]);

    $response->assertUnprocessable();
});

it('rejects an invitation for the admin role', function () {
    $admin = adminUser();

    $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/invite', [
        'fullname' => 'Should Not Work',
        'email' => 'nope2@example.com',
        'role' => 'admin',
    ]);

    $response->assertUnprocessable();
});

it('rejects an invitation with a role that does not exist at all', function () {
    $admin = adminUser();

    $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/invite', [
        'fullname' => 'Should Not Work',
        'email' => 'nope3@example.com',
        'role' => 'super_user',
    ]);

    $response->assertUnprocessable();
});

/*
|--------------------------------------------------------------------------
| Invitation -> Set Password
|--------------------------------------------------------------------------
| Full lifecycle: pending user + cached invite token -> POST /auth/
| set-password -> account becomes active AND a login token is issued in
| the same response, so the new hire doesn't have to log in separately
| right after finishing setup.
| HOW: the controller looks the token up via Cache::get('invite_token:'.
|      $token), so the test arranges that same cache entry directly
|      rather than going through the invite endpoint again.
*/
it('activates a pending account and issues a token via a valid invite token', function () {
    $user = User::factory()->create(['status' => 'pending', 'password' => null]);
    $user->assignRole('recruiter');

    $inviteToken = bin2hex(random_bytes(32));
    Cache::put('invite_token:' . $inviteToken, ['user_id' => $user->id], now()->addHours(24));

    $response = $this->postJson('/api/v1/auth/set-password', [
        'invite_token' => $inviteToken,
        'password' => 'StrongPass1!',
        'password_confirmation' => 'StrongPass1!',
    ]);

    $response->assertOk();
    expect($user->fresh()->status)->toBe('active');
    expect($user->fresh()->password)->not->toBeNull();
    expect($response->json('data.token'))->toBeString()->not->toBeEmpty();

    // the token must be single-use — Cache::forget() is called on success.
    expect(Cache::get('invite_token:' . $inviteToken))->toBeNull();
});

/*
|--------------------------------------------------------------------------
| 8.6 Invalid Invitation Token
|--------------------------------------------------------------------------
*/
it('rejects set-password with a token that was never issued', function () {
    $response = $this->postJson('/api/v1/auth/set-password', [
        'invite_token' => str_repeat('a', 64),
        'password' => 'StrongPass1!',
        'password_confirmation' => 'StrongPass1!',
    ]);

    $response->assertUnprocessable();
});

it('rejects set-password for an account that is already active', function () {
    $user = User::factory()->create(['status' => 'active', 'password' => Hash::make('Existing1!')]);
    $inviteToken = bin2hex(random_bytes(32));
    Cache::put('invite_token:' . $inviteToken, ['user_id' => $user->id], now()->addHours(24));

    $response = $this->postJson('/api/v1/auth/set-password', [
        'invite_token' => $inviteToken,
        'password' => 'StrongPass1!',
        'password_confirmation' => 'StrongPass1!',
    ]);

    $response->assertUnprocessable();
});

/*
|--------------------------------------------------------------------------
|  Suspend / Activate User
|--------------------------------------------------------------------------
| WHY check the database, not just the response? Same principle as
| logout — a friendly message doesn't prove the status column
| actually changed.
*/
it('lets an admin suspend a staff account', function () {
    $admin = adminUser();
    $recruiter = recruiterUser();

    $response = $this->actingAs($admin, 'sanctum')->patchJson("/api/v1/admin/users/{$recruiter->id}/suspend");

    $response->assertOk();
    expect($recruiter->fresh()->status)->toBe('suspended');
});

it('lets an admin activate a suspended or pending user', function () {
    $admin = adminUser();
    $recruiter = recruiterUser();
    $recruiter->update(['status' => 'suspended']);

    $response = $this->actingAs($admin, 'sanctum')->patchJson("/api/v1/admin/users/{$recruiter->id}/activate");

    $response->assertOk();
    expect($recruiter->fresh()->status)->toBe('active');
});

/*
|--------------------------------------------------------------------------
| 8.9 Cannot Suspend Admin
|--------------------------------------------------------------------------
| WHY: this protects administrative continuity — one compromised or
|      careless admin session must not be able to lock out every other
|      admin account.
*/
it('blocks an admin from suspending another admin account', function () {
    $admin = adminUser();
    $otherAdmin = adminUser();

    $response = $this->actingAs($admin, 'sanctum')->patchJson("/api/v1/admin/users/{$otherAdmin->id}/suspend");

    $response->assertForbidden();
    expect($otherAdmin->fresh()->status)->not->toBe('suspended');
});

/*
|--------------------------------------------------------------------------
| 8.10 Cannot Delete Admin
|--------------------------------------------------------------------------
*/
it('blocks an admin from deleting another admin account', function () {
    $admin = adminUser();
    $otherAdmin = adminUser();

    $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/admin/users/{$otherAdmin->id}");

    $response->assertForbidden();
    expect(User::find($otherAdmin->id))->not->toBeNull();
});

/*
|--------------------------------------------------------------------------
| 8.11 Soft Delete
|--------------------------------------------------------------------------
| WHY: this tests database SEMANTICS, not just HTTP behavior. The User
|      model uses SoftDeletes — a "deleted" user must disappear from
|      normal queries but still exist under withTrashed(), because the
|      row itself (audit trail, FK integrity) must be preserved.
*/
it('soft deletes an eligible (non-admin) user', function () {
    $admin = adminUser();
    $recruiter = recruiterUser();
    $recruiterId = $recruiter->id;

    $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/admin/users/{$recruiterId}");

    $response->assertOk();

    // gone from a normal query...
    expect(User::find($recruiterId))->toBeNull();

    // ...but still present once trashed rows are included.
    expect(User::withTrashed()->find($recruiterId))->not->toBeNull();
});

it('revokes tokens when a user is soft deleted', function () {
    $admin = adminUser();
    $recruiter = recruiterUser();
    $recruiter->createToken('active-session');

    $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/admin/users/{$recruiter->id}");

    expect($recruiter->fresh()->tokens()->count())->toBe(0);
});
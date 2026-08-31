<?php

namespace Tests;

use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\PermissionRegistrar;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // RefreshDatabase wraps every test in a transaction and rolls it back at the end.
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // Every feature test needs the real role/permission set, not a hand-rolled
        // subset — this is what actually ships, so tests should exercise it as-is.
        $this->seed(RolesAndPermissionsSeeder::class);

        // Mail is faked by default everywhere: without this, OTP/invite/notification
        // mailables would attempt to actually connect to a mailer in CI.
        Mail::fake();

        // Password::uncompromised() (RegisterRequest) calls out to the real
        // haveibeenpwned.com range API over HTTP. Faked by default so tests never
        // depend on outbound network access; a 200 with an empty body means "no
        // matches found", i.e. Laravel treats the password as not compromised.
        Http::fake([
            'api.pwnedpasswords.com/*' => Http::response('', 200),
        ]);
    }
}

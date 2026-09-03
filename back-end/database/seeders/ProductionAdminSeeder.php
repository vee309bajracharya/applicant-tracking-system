<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProductionAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = env('ADMIN_PRODUCTION_EMAIL');
        $password = env('ADMIN_PRODUCTION_PASSWORD');

        // run only if the prod env variables are provided
        if (!$email || !$password)
            $this->command?->warn('Production admin email or password not provided. Skipping seeding production admin user.');

        $admin = User::firstOrCreate(
            ['email' => $email],
            [
                'fullname' => 'System Admin',
                'password' => Hash::make($password),
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('admin');
        $this->command?->info('Production admin account successfully synchronized');
    }
}

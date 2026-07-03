<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // seed all the roles and permissions first
        $this->call(RolesAndPermissionsSeeder::class);

        // create a default admin account
        $admin = User::firstOrCreate(
            ['email' => 'admin@ats.demo'],
            [
                'fullname' => 'System Admin',
                'password' => Hash::make('Admin@90#'),
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $admin->assignRole('admin');

        $this->command->info('Default admin created for dev only');
    }
}

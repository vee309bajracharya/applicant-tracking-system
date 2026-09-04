<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProductionDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = ['admin', 'hr_manager', 'recruiter', 'candidate'];
        $password = 'smartHireDemo@123';

        foreach ($roles as $role) {
            $user = User::firstOrCreate(
                ['email' => "demo.{$role}@smarthire.live"],
                [
                    'fullname' => 'Demo ' . ucwords(str_replace('_', ' ', $role)),
                    'password' => Hash::make($password),
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]
            );
            $user->assignRole($role);
        }
        $this->command?->info('Public production demo credentials successfully synchronized');
    }
}

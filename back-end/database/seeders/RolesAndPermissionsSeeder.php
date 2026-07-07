<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //reset cached roles/permission
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // all permissions
        $permissions = [

            // user mgmt (admin)
            'users.manage',
            'users.suspend',
            'users.invite',

            // company mgmt (admin)
            'companies.manage',
            'departments.manage',

            // Read access (admin + HR manager)
            'departments.view',

            // job lifecycle (HR + Admin)
            'jobs.create',
            'jobs.edit',
            'jobs.close',
            'jobs.view',

            // hiring authority (HR only)
            'hiring.manage', //select/reject/issue offer
            'reports.export', //pdf/excel exports

            // app pipeline (recruiter)
            'applications.view',
            'applications.screen', //move to screening/shortlisted
            'interviews.manage', //schedule + manage interviews
            'candidate.notes.create', //log feedback

            // candidate self-services
            'profile.manage',
            'resume.upload',
            'applications.self.view', //read-only - own pipeline status
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'sanctum'
            ]);
        }

        // admin
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'sanctum']);
        $admin->syncPermissions(Permission::all());

        // HR manager
        $hrManager = Role::firstOrCreate(['name' => 'hr_manager', 'guard_name' => 'sanctum']);
        $hrManager->syncPermissions([
            'jobs.create',
            'jobs.edit',
            'jobs.close',
            'jobs.view',
            'hiring.manage',
            'reports.export',
            'applications.view',
            'interviews.manage',
            'departments.view',
        ]);

        // recruiter
        $recruiter = Role::firstOrCreate(['name' => 'recruiter', 'guard_name' => 'sanctum']);
        $recruiter->syncPermissions([
            'jobs.view',
            'applications.view',
            'applications.screen',
            'interviews.manage',
            'candidate.notes.create',
        ]);

        // candidate
        $candidate = Role::firstOrCreate(['name' => 'candidate', 'guard_name' => 'sanctum']);
        $candidate->syncPermissions([
            'profile.manage',
            'resume.upload',
            'applications.self.view',
        ]);

        $this->command->info('Roles and Permissions seeded');
    }
}

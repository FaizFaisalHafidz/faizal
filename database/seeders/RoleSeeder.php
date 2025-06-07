<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Dashboard permissions
            'view-dashboard',
            
            // Project management permissions
            'view-projects',
            'create-projects',
            'edit-projects',
            'delete-projects',
            'manage-project-progress',
            
            // Price list permissions
            'view-price-list',
            'create-price-list',
            'edit-price-list',
            'delete-price-list',
            
            // Report permissions
            'view-reports',
            'export-reports',
            
            // User management permissions (admin only)
            'view-users',
            'create-users',
            'edit-users',
            'delete-users',
            'assign-roles',
            
            // Public access permissions
            'view-public-content',
            'check-progress-public',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        
        // Admin Role - Full access
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        // Owner Role - Dashboard and Reports only
        $ownerRole = Role::create(['name' => 'owner']);
        $ownerRole->givePermissionTo([
            'view-dashboard',
            'view-reports',
            'export-reports',
            'view-projects', // Owner can view projects for reports
        ]);

        // Customer Role - Public access only
        $customerRole = Role::create(['name' => 'customer']);
        $customerRole->givePermissionTo([
            'view-public-content',
            'check-progress-public',
        ]);

        // Create admin user
        $adminUser = User::create([
            'name' => 'Administrator',
            'email' => 'admin@garasiarmstrong.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $adminUser->assignRole('admin');

        // Create owner user
        $ownerUser = User::create([
            'name' => 'Owner Garasi Armstrong',
            'email' => 'owner@garasiarmstrong.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $ownerUser->assignRole('owner');

        // Create customer user
        $customerUser = User::create([
            'name' => 'Customer Test',
            'email' => 'customer@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $customerUser->assignRole('customer');

        $this->command->info('Roles and permissions created successfully!');
        $this->command->info('Admin: admin@garasiarmstrong.com | password123');
        $this->command->info('Owner: owner@garasiarmstrong.com | password123');
        $this->command->info('Customer: customer@example.com | password123');
    }
}

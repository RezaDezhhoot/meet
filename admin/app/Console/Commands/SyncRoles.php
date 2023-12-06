<?php

namespace App\Console\Commands;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\PermissionTableSeeder;
use Database\Seeders\RoleTableSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class SyncRoles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:sync-roles {--super-admin-id=1} {--truncate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $truncate = $this->option('truncate');
        $superAdminId = $this->option('super-admin-id');
        if ($truncate) {
            Permission::truncate();
            Role::truncate();
        }

        Artisan::call('db:seed', [
            '--class' => PermissionTableSeeder::class,
            '--force' => true
        ]);

        Artisan::call('db:seed', [
            '--class' => RoleTableSeeder::class,
            '--force' => true
        ]);

        $permission = Permission::all()->pluck('name');
        $administrator = Role::findByName('administrator')->syncPermissions($permission);
        $super_admin = Role::findByName('super_admin')->syncPermissions($permission);
        $admin = Role::findByName('admin');

        if ($user = User::query()->find($superAdminId)) {
            $user->syncRoles([$administrator->name,$super_admin->name,$admin->name]);
        }
    }
}

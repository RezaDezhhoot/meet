<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            ['name' => 'show_dashboard' , 'guard_name'=> 'web'],

            ['name' => 'show_users' , 'guard_name'=> 'web'],
            ['name' => 'edit_users' , 'guard_name'=> 'web'],
            ['name' => 'delete_users' , 'guard_name'=> 'web'],

            ['name' => 'show_roles' , 'guard_name'=> 'web'],
            ['name' => 'edit_roles' , 'guard_name'=> 'web'],
            ['name' => 'delete_roles' , 'guard_name'=> 'web'],

            ['name' => 'show_rooms' , 'guard_name'=> 'web'],
            ['name' => 'edit_rooms' , 'guard_name'=> 'web'],
            ['name' => 'delete_rooms' , 'guard_name'=> 'web'],

            ['name' => 'show_subscriptions' , 'guard_name'=> 'web'],
            ['name' => 'edit_subscriptions' , 'guard_name'=> 'web'],
            ['name' => 'delete_subscriptions' , 'guard_name'=> 'web'],

            ['name' => 'index_chats' , 'guard_name'=> 'web'],
            ['name' => 'delete_chats' , 'guard_name'=> 'web'],

            ['name' => 'index_penalties' , 'guard_name'=> 'web'],
            ['name' => 'delete_penalties' , 'guard_name'=> 'web'],

            ['name' => 'index_logs' , 'guard_name'=> 'web'],

            ['name' => 'show_tokens' , 'guard_name'=> 'web'],
            ['name' => 'edit_tokens' , 'guard_name'=> 'web'],
            ['name' => 'delete_tokens' , 'guard_name'=> 'web'],

            ['name' => 'show_settings' , 'guard_name'=> 'web'],
            ['name' => 'edit_base_settings' , 'guard_name'=> 'web'],
        ];

        foreach ($permissions as $permission) {
            Permission::query()->updateOrCreate([
                'name' => $permission['name']
            ],[
                'guard_name' => 'web'
            ]);
        }
    }
}

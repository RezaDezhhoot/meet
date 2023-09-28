<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'administrator'
            ],
            [
                'name' => 'admin',
            ],
            [
                'name' => 'super_admin',
            ]
        ];
        foreach ($roles as $role) {
            Role::query()->updateOrCreate(['name' => $role['name']]);
        }
    }
}

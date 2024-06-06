<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Administrador',
            'surname' => 'Bitaldata',
            'ci' => '0000000000',
            'phone' => '0000000000',
            'address' => 'Quito',
            'city' => 'Quito',
            'email' => 'admin@bitaldata.com',
            'password' => bcrypt('password'),
        ])->assignRole(['Administrador', 'Centralista', 'Guardia', 'Supervisor', 'SuperAdministrador']);
    }
}

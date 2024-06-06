<?php

namespace Database\Seeders;

use App\Models\Complex;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ComplexSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Complex::create([
            'name' => 'Complejo 1',
            'address' => 'Calle 1',
            'city' => 'Ciudad 1',
            'company_id' => '1',
            'user_id' => '1',
        ]);

        Complex::create([
            'name' => 'Complejo 2',
            'address' => 'Calle 2',
            'city' => 'Ciudad 2',
            'company_id' => '1',
            'user_id' => '1',
        ]);

        Complex::create([
            'name' => 'Complejo 3',
            'address' => 'Calle 3',
            'city' => 'Ciudad 3',
            'company_id' => '1',
            'user_id' => '1',
        ]);

        Complex::create([
            'name' => 'Complejo 4',
            'address' => 'Calle 4',
            'city' => 'Ciudad 4',
            'company_id' => '1',
            'user_id' => '1',
        ]);

        Complex::create([
            'name' => 'Complejo 5',
            'address' => 'Calle 5',
            'city' => 'Ciudad 5',
            'company_id' => '1',
            'user_id' => '1',
        ]);
    }
}

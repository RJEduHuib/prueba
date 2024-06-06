<?php

namespace Database\Seeders;

use App\Models\House;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class HouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //$house_data = file_get_contents(database_path('data/datos.json'));

        /*
            {"NUMERO DE CASA":"CASA 01","NOMBRES":"JOSE","APELLIDOS":"TOBAR","TELEFONO 1":3617484,"TELEFONO 2":997324313,"EMAIL":"pepetobar@hotmail.com","CONJUNTO":9}
        */

        //$houses = json_decode($house_data, true);

        /*
             protected $fillable = [
                'complex_id',
                'number_house',
                'owner_name',
                'owner_surname',
                'owner_email',
                'owner_phone',
                'owner_phone_2',
            ];
        */

        /*
        foreach($houses as $house)
        {
            House::create([
                'complex_id' => $house['CONJUNTO'],
                'number_house' => $house['NUMERO DE CASA'],
                'owner_name' => $house['NOMBRES'],
                'owner_surname' => $house['APELLIDOS'],
                'owner_email' => $house['EMAIL'],
                'owner_phone' => $house['TELEFONO 1'],
                'owner_phone_2' => $house['TELEFONO 2'],
            ]);
        }
        */

        House::create([
            'complex_id' => 1,
            'number_house' => 'CASA 01',
            'owner_name' => 'JOSE',
            'owner_surname' => 'TOBAR',
            'owner_email' => 'jose@tobar.com',
            'owner_phone' => 3617484,
            'owner_phone_2' => 997324313,
        ]);

        House::create([
            'complex_id' => 1,
            'number_house' => 'CASA 02',
            'owner_name' => 'MARIA',
            'owner_surname' => 'PEREZ',
            'owner_email' => 'maria@preze.com',
            'owner_phone' => 3617484,
            'owner_phone_2' => 997324313,
        ]);

        House::create([
            'complex_id' => 2,
            'number_house' => 'CASA 01',
            'owner_name' => 'JUAN',
            'owner_surname' => 'GOMEZ',
            'owner_email' => 'ju@gomez.com',
            'owner_phone' => 3617484,
            'owner_phone_2' => 997324313,
        ]);
    }
}

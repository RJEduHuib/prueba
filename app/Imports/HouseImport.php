<?php

namespace App\Imports;

use App\Models\House;
use Illuminate\Database\Eloquent\Model;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Imports\HeadingRowFormatter;

HeadingRowFormatter::default('none');

class HouseImport implements ToModel, WithHeadingRow
{
    public $complex_id = null;

    public function __construct($complex_id)
    {
        $this->complex_id = $complex_id;
    }

    /**
    * @param array $row
    *
    * @return Model|null
    */
    public function model(array $row): ?Model
    {
        $names = explode(' ', $row['NOMBRES']);

        $owner_name = '';
        $owner_surname = '';
        $owner_phone_1 = '';
        $owner_phone_2 = '';

        if (count($names) == 4) {
            $owner_name = $names[0] . ' ' . $names[1];
            $owner_surname = $names[2] . ' ' . $names[3];
        }
        if (count($names) == 3) {
            $owner_name = $names[0];
            $owner_surname  = $names[1] . ' ' . $names[2];
        }
        if (count($names) == 2) {
            $owner_name = $names[0];
            $owner_surname = $names[1];
        }

        if (strlen($row['TELEFONO 1']) == 10)
        {
            $owner_phone_1 = substr($row['TELEFONO 1'], 1);
        }
        else
        {
            $owner_phone_1 = $row['TELEFONO 1'];
        }

        if (strlen($row['TELEFONO 2']) == 10)
        {
            $owner_phone_2 = substr($row['TELEFONO 2'], 1);
        }
        else
        {
            $owner_phone_2 = $row['TELEFONO 2'];
        }

        return House::create([
            'complex_id' => $this->complex_id,
            'number_house' => 'CASA ' . $row['NUMERO DE CASA'],
            'owner_name' => $owner_name,
            'owner_surname' => $owner_surname,
            'owner_email' => $row['EMAIL'] ?? 'Sin Email',
            'owner_phone' => $owner_phone_1 ?? 'Sin Teléfono',
            'owner_phone_2' => $owner_phone_2 ?? 'Sin Teléfono',
            'active' => 1,
        ]);
    }

    /**
     * @return int
     */
    public function headingRow(): int
    {
        return 1;
    }
}

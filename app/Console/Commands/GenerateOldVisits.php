<?php

namespace App\Console\Commands;

use App\Jobs\ProcessVisitOld;
use App\Models\Complex;
use App\Models\Visit;
use Carbon\Carbon;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GenerateOldVisits extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:generate-old-visits';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        try
        {
            $visits = Visit::whereNull('file_id')->get();

            $this->info($visits->count() . ' visitas encontradas');

            foreach ($visits as $visit)
            {
                $this->info('Generando visitas antiguas' . $visit->id);

                $vehicle = [];
                $person = [];

                $uuid = Str::uuid();

                $visit->load('house');
                $visit->load('user');

                $complex_id = $visit->house->complex_id;
                $complex = Complex::find($complex_id);

                $complex->load('company');
                $company_name = $complex->company->name;

                //Vehicle Plates
                $client = new Client(['verify' => false]);
                $response = $client->request('GET', 'https://srienlinea.sri.gob.ec/movil-servicios/api/v1.0/matriculacion/valor/' . $visit->vehicle_plate);

                if ($response->getStatusCode() !== 404)
                {
                    $data = json_decode($response->getBody(), true);

                    $vehicle = [
                        'last_date_enrollment' => $this->FormatDate($data['fechaUltimaMatricula']),
                        'date_expiration_enrollment' => $this->FormatDate($data['fechaCaducidadMatricula']),
                        'date_buy' => $this->FormatDate($data['fechaCompra']),
                        'date_enrollment_anual' => $this->FormatDate($data['fechaRevision']),
                        'cylinder' => $data['cilindraje'],
                        'canton' => $data['cantonMatricula'],
                        'plate' => $data['placa'],
                        'brand' => $data['marca'],
                        'model' => $data['modelo'],
                        'model_year' => $data['anioModelo'],
                        'class' => $data['clase'],
                        'service' => $data['servicio'],
                    ];
                }

                //Person Data
                $response = $client->request('GET', 'https://srienlinea.sri.gob.ec/movil-servicios/api/v1.0/deudas/porIdentificacion/' . $visit->visitor_id . '/?tipoPersona=N&_=1694224760152');

                if ($response->getStatusCode() !== 404)
                {
                    $data = json_decode($response->getBody(), true);

                    $person = [
                        'ci' => $data['contribuyente']['identificacion'],
                        'name' => $data['contribuyente']['nombreComercial'],
                        'date_information' => $this->FormatDate($data['contribuyente']['fechaInformacion']),
                    ];
                }

                $images = array();

                $images_array = json_decode($visit->visit_images, true);

                foreach ($images_array as $image)
                {
                    $url = Storage::disk('public')->url('images_security/' . $image);

                    $images[] = $url;
                }

                $payload = [
                    'visitor' => [
                        'visit_date' => $visit->visit_date,
                        'visit_time' => $visit->visit_time,
                        'number_visitors'  => $visit->number_visitors,
                        'type_visit' => $visit->type_visit,
                        'description' => $visit->description ?? 'Sin Observaciones',
                    ],
                    'owner' => [
                        'owner_name' => $visit->house->owner_name . ' ' . $visit->house->owner_surname,
                        'number_house' => $visit->house->number_house,
                        'owner_email' => $visit->house->owner_email,
                        'owner_phone' => $visit->house->owner_phone,
                    ],
                    'plate' => $visit->vehicle_plate,
                    'visitor_id' => $visit->visitor_id,
                    'images' => $images,
                    'hash' => $uuid,
                    'camera_number' => count($images),
                    'complex_name' => $complex->name,
                    'company_name' => $company_name,
                    'vehicle' => $vehicle,
                    'person' => $person,
                ];

                $visit->file_id = $uuid;
                $visit->save();

                dispatch(new ProcessVisitOld($payload));
            }

            $this->info('Visitas generadas correctamente');
        }
        catch (GuzzleException $e)
        {
            $this->error($e->getMessage());
        }
    }

    public function FormatDate($date): string
    {
        $date_convert = $date / 1000;

        $date_carbon = Carbon::parse($date_convert);

        $day_name = ucfirst($date_carbon->translatedFormat('l'));

        $month_name = ucfirst($date_carbon->translatedFormat('F'));

        $year = $date_carbon->year;

        $full_date = "$day_name, $date_carbon->day de $month_name de $year";

        return $full_date;
    }
}

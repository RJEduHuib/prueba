<?php

namespace App\Http\Controllers;

use Throwable;
use Carbon\Carbon;
use Illuminate\Http\Request;
use MegaCreativo\API\CedulaVE;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class ExternDataController extends Controller
{
    protected $days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    protected $months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembe', 'Octubre', 'Noviembre', 'Diciembre'];

    public function vehicle(Request $request, $plate): JsonResponse
    {
        try
        {
            $client = new \GuzzleHttp\Client(['verify' => false]);

            $response = $client->request('GET', 'https://srienlinea.sri.gob.ec/movil-servicios/api/v1.0/matriculacion/valor/' . $plate);

            if($response->getStatusCode() == 404)
            {
                return response()->json([
                    'status' => false,
                    'data' => null,
                    'message' => 'No se encontraron datos'
                ]);
            }

            $data = json_decode($response->getBody(), true);

            $data_mapped = [
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

            return response()->json([
                'status' => true,
                'data' => $data_mapped,
                'message' => 'Datos encontrados'
            ]);
        }
        catch(Throwable $th)
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'No se encontraron datos',
                'error' => $th->getMessage()
            ]);
        }
    }

    public function person(Request $request, $ci) : JsonResponse
    {
        try
        {
            $client = new \GuzzleHttp\Client(['verify' => false]);

            $response = $client->request('GET', 'https://srienlinea.sri.gob.ec/movil-servicios/api/v1.0/deudas/porIdentificacion/' . $ci . '/?tipoPersona=N&_=1694224760152');

            if($response->getStatusCode() == 404)
            {
                return response()->json([
                    'status' => false,
                    'data' => null,
                    'message' => 'No se encontraron datos'
                ]);
            }

            $data = json_decode($response->getBody(), true);

            $data_mapped = [
                'ci' => $data['contribuyente']['identificacion'],
                'name' => $data['contribuyente']['nombreComercial'],
                'date_information' => $this->FormatDate($data['contribuyente']['fechaInformacion']),
            ];

            return response()->json([
                'status' => true,
                'data' => $data_mapped,
                'message' => 'Datos encontrados'
            ]);
        }
        catch(Throwable $th)
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'No se encontraron datos',
                'error' => $th->getMessage()
            ]);
        }
    }

    public function person_ve(Request $request, $ci) : JsonResponse
    {
        try
        {
            $first_character = substr($ci, 0, 1);

            if($first_character == 'V' || $first_character == 'E')
            {
                $ci = substr($ci, 1, strlen($ci));
            }

            $response = CedulaVE::info($first_character, $ci, false);

            unset($response['api']);
            unset($response['status']);
            unset($response['version']);

            $response['data']['name'] = $response['data']['name'] . ' ' . $response['data']['lastname'];

            unset($response['data']['lastname']);

            return response()->json([
                'status' => true,
                'data' => $response['data'],
                'message' => 'Datos encontrados'
            ]);
        }
        catch(Throwable $th)
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'No se encontraron datos',
                'error' => $th->getMessage()
            ]);
        }
    }


    public function FormatDate($date)
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

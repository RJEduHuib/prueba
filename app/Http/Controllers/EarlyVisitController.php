<?php

namespace App\Http\Controllers;

use Throwable;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\EarlyVisit;
use App\Mail\QRNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class EarlyVisitController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('EarlyVisit/Index');
    }

    public function createView(): Response
    {
        return Inertia::render('EarlyVisit/Create');
    }

    public function editView(Request $request, $id): Response
    {
        $earlyVisit = EarlyVisit::with('house')->find($id);

        return Inertia::render('EarlyVisit/Edit', [
            'earlyVisit' => $earlyVisit
        ]);
    }

    public function create(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'house_id' => 'required|integer',
            'visit_date' => 'required|date',
            'visit_time' => 'required',
            'description' => 'nullable|string',
            'vehicle_plate' => 'nullable|string|min:6|max:7',
            'visitor_ci' => 'required|string|min:10|max:13',
            'number_visitors' => 'required|integer|between:1,10',
            'type_visit' => 'required|string',
        ], [
            'house_id.required' => 'La casa es requerida',
            'visit_date.required' => 'La fecha de visita es requerida',
            'vehicle_plate.string' => 'La placa del vehículo debe ser una cadena de texto',
            'vehicle_plate.min' => 'La placa del vehículo debe tener al menos 6 caracteres',
            'vehicle_plate.max' => 'La placa del vehículo debe tener máximo 7 caracteres',
            'visit_time.required' => 'La hora de visita es requerida',
            'visitor_ci.required' => 'La cédula del visitante es requerida',
            'visitor_ci.string' => 'La cédula del visitante debe ser una cadena de texto',
            'visitor_ci.min' => 'La cédula del visitante debe tener al menos 10 caracteres',
            'visitor_ci.max' => 'La cédula del visitante debe tener máximo 13 caracteres',
            'number_visitors.required' => 'El número de visitantes es requerido',
            'number_visitors.between' => 'El número de visitantes debe estar entre 1 y 10',
            'type_visit.required' => 'El tipo de visita es requerido',
        ]);

        if ($validator->fails()) 
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $validator->errors()
            ]);
        }

        try
        {
            DB::beginTransaction();

            $earlyVisit = EarlyVisit::create([
                'house_id' => $request->input('house_id'),
                'user_id' => auth()->user()->id,
                'visit_date' => $request->input('visit_date'),
                'visit_time' => $request->input('visit_time'),
                'description' => $request->input('description'),
                'vehicle_plate' => $request->input('vehicle_plate'),
                'visitor_ci' => $request->input('visitor_ci'),
                'number_visitors' => $request->input('number_visitors'),
                'type_visit' => $request->input('type_visit'),
                'pending' => 1,
            ]);

            $qrCodeData = $earlyVisit->id;

            $qrCode = QrCode::format('png')->size(500)->generate($qrCodeData);

            $filename = 'early_visit_' . time() . '.png';

            Storage::disk('public')->put('qrcodes/' . $filename, $qrCode);

            $earlyVisit->update([
                'qr_code' => $filename,
            ]);

            $qr_url = Storage::disk('public')->url('qrcodes/' . $filename);

            $house = $earlyVisit->house;

            Mail::to($house->owner_email)->send(new QRNotification($qr_url, $earlyVisit->visit_date, $earlyVisit->visit_time));

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'errors' => null,
                'message' => 'La visita anticipada fue creada exitosamente'
            ]);
        }
        catch(Throwable $e)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $e->getMessage(),
                'message' => 'La visita anticipada no pudo ser creada'
            ]);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'house_id' => 'required|integer',
            'visit_date' => 'required|date',
            'visit_time' => 'required',
            'description' => 'nullable|string',
            'vehicle_plate' => 'nullable|string|min:6|max:7',
            'visitor_ci' => 'required|string|min:10|max:13',
            'number_visitors' => 'required|integer|between:1,10',
            'type_visit' => 'required|string',
        ], [
            'house_id.required' => 'La casa es requerida',
            'visit_date.required' => 'La fecha de visita es requerida',
            'visit_time.required' => 'La hora de visita es requerida',
            'vehicle_plate.required' => 'La placa del vehículo es requerida',
            'vehicle_plate.string' => 'La placa del vehículo debe ser una cadena de texto',
            'vehicle_plate.min' => 'La placa del vehículo debe tener al menos 6 caracteres',
            'vehicle_plate.max' => 'La placa del vehículo debe tener máximo 7 caracteres',
            'visitor_ci.required' => 'La cédula del visitante es requerida',
            'visitor_ci.string' => 'La cédula del visitante debe ser una cadena de texto',
            'visitor_ci.min' => 'La cédula del visitante debe tener al menos 10 caracteres',
            'visitor_ci.max' => 'La cédula del visitante debe tener máximo 13 caracteres',
            'number_visitors.required' => 'El número de visitantes es requerido',
            'number_visitors.between' => 'El número de visitantes debe estar entre 1 y 10',
            'type_visit.required' => 'El tipo de visita es requerido',
        ]);

        if ($validator->fails()) 
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $validator->errors()
            ]);
        }

        try
        {
            DB::beginTransaction();

            $earlyVisit = EarlyVisit::find($id);

            $earlyVisit->update([
                'house_id' => $request->input('house_id'),
                'user_id' => auth()->user()->id,
                'visit_date' => $request->input('visit_date'),
                'visit_time' => $request->input('visit_time'),
                'description' => $request->input('description'),
                'vehicle_plate' => $request->input('vehicle_plate'),
                'visitor_ci' => $request->input('visitor_ci'),
                'number_visitors' => $request->input('number_visitors'),
                'type_visit' => $request->input('type_visit'),
                'pending' => 1,
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'La visita anticipada fue actualizada exitosamente'
            ]);
        }
        catch(Throwable $e)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $e->getMessage(),
                'message' => 'La visita anticipada no pudo ser actualizada'
            ]);
        }
    }

    public function destroy($id): JsonResponse
    {
        try
        {
            DB::beginTransaction();

            $earlyVisit = EarlyVisit::find($id);

            Storage::disk('public')->delete('qrcodes/' . $earlyVisit->qr_code);

            $earlyVisit->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'La visita anticipada fue eliminada exitosamente'
            ]);
        }
        catch(Throwable $e)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $e->getMessage(),
                'message' => 'La visita anticipada no pudo ser eliminada'
            ]);
        }
    }

    public function show($id): JsonResponse
    {
        try
        {
            $earlyVisit = EarlyVisit::with('house', 'user')->find($id);

            $earlyVisit->qr_code = Storage::disk('public')->url('qrcodes/' . $earlyVisit->qr_code);

            if(!$earlyVisit)
            {
                return response()->json([
                    'status' => false,
                    'data' => null,
                    'message' => 'La visita anticipada no pudo ser encontrada'
                ]);
            }

            $person = [];
            $vehicle = [];

            $responseVehicle = Http::get('https://srienlinea.sri.gob.ec/movil-servicios/api/v1.0/matriculacion/valor/' . $earlyVisit->vehicle_plate);

            if($responseVehicle->status() == 200)
            {
                $dataVehicle = $responseVehicle->json();

                $vehicle = [
                    'class' => $dataVehicle['clase'],
                    'plate' => $dataVehicle['placa'],
                    'brand' => $dataVehicle['marca'],
                    'model' => $dataVehicle['anioModelo'],
                    'service' => $dataVehicle['servicio'],
                    'date_enrollment_anual' => $this->FormatDate($dataVehicle['fechaRevision']),
                ]; 
            }
            else
            {
                $vehicle = false;
            } 

            $responsePerson = Http::get('https://srienlinea.sri.gob.ec/movil-servicios/api/v1.0/deudas/porIdentificacion/' . $earlyVisit->visitor_ci . '/?tipoPersona=N&_=1694224760152');

            if($responsePerson->status() == 200)
            {
                $dataPerson = $responsePerson->json();

                $person = [
                    'ci' => $dataPerson['contribuyente']['identificacion'],
                    'name' => $dataPerson['contribuyente']['nombreComercial'],
                    'date_information' => $this->FormatDate($dataPerson['contribuyente']['fechaInformacion']),
                ];
            }
            else
            {
                $person = false;
            }

            $data = [
                'visit' => $earlyVisit,
                'person' => $person,
                'vehicle' => $vehicle,
            ];

            return response()->json([
                'status' => true,
                'data' => $data,
                'message' => 'La visita anticipada fue encontrada exitosamente'
            ]);
        }
        catch(Throwable $e)
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $e->getMessage(),
                'message' => 'La visita anticipada no pudo ser encontrada'
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


    public function approve(Request $request, $id): JsonResponse
    {
        try
        {
            DB::beginTransaction();

            $earlyVisit = EarlyVisit::find($id);

            if($earlyVisit)
            {
                if($earlyVisit->pending == 0)
                {
                    return response()->json([
                        'status' => false,
                        'data' => null,
                        'message' => 'La visita anticipada ya fue aprobada anteriormente'
                    ]);
                }

                $date = date('Y-m-d');

                if($earlyVisit->visit_date < $date)
                {
                    return response()->json([
                        'status' => false,
                        'data' => null,
                        'message' => 'La visita anticipada no puede ser aprobada porque la fecha de visita ya pasó'
                    ]);
                }

                $earlyVisit->update([
                    'pending' => 0,
                    'approve_time' => date('H:i:s'),
                    'approved_by' => auth()->user()->id,
                ]);

                DB::commit();

                return response()->json([
                    'status' => true,
                    'data' => $earlyVisit,
                    'message' => 'La visita anticipada fue aprobada exitosamente'
                ]);
            }
            else
            {
                DB::rollBack();

                return response()->json([
                    'status' => false,
                    'data' => null,
                    'message' => 'La visita anticipada no pudo ser encontrada'
                ]);
            }
        }
        catch(Throwable $e)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $e->getMessage(),
                'message' => 'La visita anticipada no pudo ser aprobada'
            ]);
        }
    }



    public function list(Request $request): JsonResponse
    {
        $user = Auth::user();

        if($user->hasRole('Administrador'))
        {
            if($request->search == '')
            {
                $earlyVisits = EarlyVisit::with('house', 'user')->orderBy('id', 'desc')->paginate($request->size);

                foreach($earlyVisits as $earlyVisit)
                {
                    $earlyVisit->qr_code = Storage::disk('public')->url('qrcodes/' . $earlyVisit->qr_code);
                }
            }
            else
            {
                $earlyVisits = EarlyVisit::with('house', 'user')
                    ->where('id', 'like', '%' . $request->search . '%')
                    ->orWhere('visit_date', 'like', '%' . $request->search . '%')
                    ->orWhere('visit_time', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhere('vehicle_plate', 'like', '%' . $request->search . '%')
                    ->orWhere('visitor_ci', 'like', '%' . $request->search . '%')
                    ->orWhere('number_visitors', 'like', '%' . $request->search . '%')
                    ->orWhere('type_visit', 'like', '%' . $request->search . '%')
                    ->orWhere('pending', 'like', '%' . $request->search . '%')
                    ->orWhere('qr_code', 'like', '%' . $request->search . '%')
                    ->orWhereHas('house', function($query) use ($request) {
                        $query->where('number_house', 'like', '%' . $request->search . '%')
                            ->orWhere('owner_name', 'like', '%' . $request->search . '%')
                            ->orWhere('owner_surname', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('user', function($query) use ($request) {
                        $query->where('name', 'like', '%' . $request->search . '%');
                    })
                    ->orderBy('id', 'desc')
                    ->paginate($request->size);

                foreach($earlyVisits as $earlyVisit)
                {
                    $earlyVisit->qr_code = Storage::disk('public')->url('qrcodes/' . $earlyVisit->qr_code);
                }
            }
        }
        else
        {
            if($request->search == '')
            {
                $earlyVisits = EarlyVisit::with('house', 'user')->where('user_id', $user->id)->orderBy('id', 'desc')->paginate($request->size);

                foreach($earlyVisits as $earlyVisit)
                {
                    $earlyVisit->qr_code = Storage::disk('public')->url('qrcodes/' . $earlyVisit->qr_code);
                }
            }
            else
            {
                $earlyVisits = EarlyVisit::with('house', 'user')
                    ->where('user_id', $user->id)
                    ->where('id', 'like', '%' . $request->search . '%')
                    ->orWhere('visit_date', 'like', '%' . $request->search . '%')
                    ->orWhere('visit_time', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhere('vehicle_plate', 'like', '%' . $request->search . '%')
                    ->orWhere('visitor_ci', 'like', '%' . $request->search . '%')
                    ->orWhere('number_visitors', 'like', '%' . $request->search . '%')
                    ->orWhere('type_visit', 'like', '%' . $request->search . '%')
                    ->orWhere('pending', 'like', '%' . $request->search . '%')
                    ->orWhere('qr_code', 'like', '%' . $request->search . '%')
                    ->orWhereHas('house', function($query) use ($request) {
                        $query->where('number_house', 'like', '%' . $request->search . '%')
                            ->orWhere('owner_name', 'like', '%' . $request->search . '%')
                            ->orWhere('owner_surname', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('user', function($query) use ($request) {
                        $query->where('name', 'like', '%' . $request->search . '%');
                    })
                    ->orderBy('id', 'desc')
                    ->paginate($request->size);

                foreach($earlyVisits as $earlyVisit)
                {
                    $earlyVisit->qr_code = Storage::disk('public')->url('qrcodes/' . $earlyVisit->qr_code);
                }
            }
        }

        return response()->json($earlyVisits);
    }
}

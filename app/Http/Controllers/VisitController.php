<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessVisit;
use App\Jobs\ProcessVisitNotification;
use Throwable;
use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Visit;
use Inertia\Response;
use App\Models\Complex;
use Illuminate\Http\File;
use Illuminate\Http\Request;
use App\Mail\EmailNotification;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use FFMpeg\Filters\Video\ResizeFilter;
use Symfony\Component\Process\Process;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\Process\Exception\ProcessFailedException;

class VisitController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Visit/Index');
    }

    public function createView(): Response
    {
        return Inertia::render('Visit/Create');
    }

    public function editView(Request $request, $id): Response
    {
        $visit = Visit::find($id);

        return Inertia::render('Visit/Edit', [
            'visit' => $visit
        ]);
    }

    public function create(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'visit_date' => 'required|date',
            'visit_time' => 'required',
            'description' => 'nullable|string|max:255',
            'visit_images.*' => 'nullable',
            'vehicle_plate' => 'nullable|string|min:6|max:10',
            'visitor_ci' => 'nullable|string|min:10|max:13',
            'number_visitors' => 'required|integer|between:1,10',
            'type_visit' => 'required|string',
            'house_id' => 'required|integer',
        ], [
            'visit_date.required' => 'La fecha de visita es requerida',
            'visit_date.date' => 'La fecha de visita debe ser una fecha válida',
            'visit_time.required' => 'La hora de visita es requerida',
            'description.string' => 'La descripción debe ser un texto',
            'description.max' => 'La descripción no debe exceder los 255 caracteres',
            'vehicle_plate.string' => 'La placa del vehículo debe ser un texto',
            'vehicle_plate.min' => 'La placa del vehículo debe tener al menos 6 caracteres',
            'vehicle_plate.max' => 'La placa del vehículo no debe exceder los 7 caracteres',
            'visitor_ci.min' => 'La identificación del visitante debe tener al menos 10 caracteres',
            'visitor_ci.max' => 'La identificación del visitante no debe exceder los 13 caracteres',
            'visitor_ci.string' => 'La identificación del visitante debe ser un texto',
            'number_visitors.required' => 'El número de visitantes es requerido',
            'number_visitors.integer' => 'El número de visitantes debe ser un número entero',
            'number_visitors.between' => 'El número de visitantes debe estar entre 1 y 10',
            'type_visit.required' => 'El tipo de visita es requerido',
            'type_visit.string' => 'El tipo de visita debe ser un texto',
            'house_id.required' => 'La casa es requerida',
            'house_id.integer' => 'La casa debe ser un número entero',
        ]);

        $vehicle = json_decode($request->vehicle, true);
        $person = json_decode($request->person, true);

        if ($validator->fails())
        {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors(),
                'message' => 'Error al crear la visita, por favor verifique los campos',
                'data' => null
            ]);
        }

        try
        {
            DB::beginTransaction();

            $imagePaths = [];
            $url_images = [];
            $uuid = \Str::uuid();

            $visit = Visit::create([
                'user_id' => auth()->user()->id,
                'visit_date' => date('Y-m-d', strtotime($request->visit_date)),
                'visit_time' => $request->visit_time,
                'description' => $request->description,
                'visit_images' => json_encode($imagePaths),
                'original_visit_images' => $request->original_visit_images,
                'vehicle_plate' => $request->vehicle_plate,
                'visitor_id' => $request->visitor_ci,
                'number_visitors' => $request->number_visitors,
                'type_visit' => $request->type_visit,
                'house_id' => $request->house_id,
                'file_id' => $uuid,
            ]);

            $visit->load('house');
            $visit->load('user');

            $complex_id = $visit->house->complex_id;
            $complex = Complex::find($complex_id);

            $complex->load('company');
            $company_name = $complex->company->name;

            if($complex->is_cameras)
            {
                if($request->hasFile('visit_images'))
                {
                    foreach($request->file('visit_images') as $index => $image)
                    {
                        $path = Storage::disk('public')->put('images_security', $image);

                        $imagePaths[] = basename($path);

                        $url_images[] = Storage::disk('public')->url('images_security/' . basename($path));
                    }

                    $visit->visit_images = json_encode($imagePaths);

                    $visit->save();
                }
            }

            $response = '';

            if($complex->is_whatsapp)
            {
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
                    'images' => $url_images,
                    'hash' => $uuid,
                    'camera_number' => count($url_images),
                    'vehicle' => $vehicle,
                    'person' => $person,
                    'complex_name' => $complex->name,
                    'company_name' => $company_name,
                    'complex_emails' => $complex->admin_email,
                ];

                $number_1 = $visit->house->owner_phone;
                $number_1 = '593' . $number_1;

                $message = 'Estimado ' . $visit->house->owner_name . ' ' .$visit->house->owner_surname . ' se le informa que el día ' .$visit->visit_date . ' a las ' . $visit->visit_time . ' se registró una visita en su domicilio. Para ver el detalle de la visita ingrese al siguiente enlace:';

                dispatch(new ProcessVisit($number_1, $message, $payload));
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Bitácora creada correctamente',
                'response' => $response
            ]);
        }
        catch(Throwable $e)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'errors' => $e->getMessage(),
                'data' => null,
                'message' => 'Error al crear la Bitácora' . $e->getMessage(),
            ]);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'visit_date' => 'required|date',
            'visit_time' => 'required',
            'description' => 'nullable|string|max:255',
            'visit_images' => 'nullable',
            'vehicle_plate' => 'nullable|string|min:6|max:7',
            'visitor_id' => 'nullable|string|min:10|max:13',
            'number_visitors' => 'required|integer|between:1,10',
            'type_visit' => 'required|string',
            'house_id' => 'required|integer',
        ], [
            'visit_date.required' => 'La fecha de visita es requerida',
            'visit_date.date' => 'La fecha de visita debe ser una fecha válida',
            'visit_time.required' => 'La hora de visita es requerida',
            'description.string' => 'La descripción debe ser un texto',
            'description.max' => 'La descripción no debe exceder los 255 caracteres',
            'vehicle_plate.string' => 'La placa del vehículo debe ser un texto',
            'vehicle_plate.min' => 'La placa del vehículo debe tener al menos 6 caracteres',
            'vehicle_plate.max' => 'La placa del vehículo no debe exceder los 7 caracteres',
            'visitor_id.string' => 'La identificación del visitante debe ser un texto',
            'visitor_id.min' => 'La identificación del visitante debe tener al menos 10 caracteres',
            'visitor_id.max' => 'La identificación del visitante no debe exceder los 13 caracteres',
            'number_visitors.required' => 'El número de visitantes es requerido',
            'number_visitors.integer' => 'El número de visitantes debe ser un número entero',
            'number_visitors.between' => 'El número de visitantes debe estar entre 1 y 10',
            'type_visit.required' => 'El tipo de visita es requerido',
            'type_visit.string' => 'El tipo de visita debe ser un texto',
            'house_id.required' => 'La casa es requerida',
            'house_id.integer' => 'La casa debe ser un número entero',
        ]);

        if ($validator->fails())
        {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors(),
                'data' => null
            ]);
        }

        try
        {
            DB::beginTransaction();

            $visit = Visit::find($id);

            $visit->update([
                'user_id' => auth()->user()->id,
                'visit_date' => $request->visit_date,
                'visit_time' => $request->visit_time,
                'description' => $request->description,
                'visit_images' => $request->visit_images,
                'original_visit_images' => $request->original_visit_images,
                'vehicle_plate' => $request->vehicle_plate,
                'visitor_id' => $request->visitor_id,
                'number_visitors' => $request->number_visitors,
                'type_visit' => $request->type_visit,
                'house_id' => $request->house_id,
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'errors' => null,
                'data' => null,
                'message' => 'Bitácora actualizada correctamente',
            ]);
        }
        catch(Throwable $e)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'errors' => $e->getMessage(),
                'data' => null,
                'message' => 'Error al actualizar la Bitácora',
            ]);
        }
    }

    public function destroy($id) :JsonResponse
    {
        try
        {
            DB::beginTransaction();

            $visit = Visit::find($id);

            $visit->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'errors' => null,
                'data' => null,
                'message' => 'Bitácora eliminada correctamente',
            ]);
        }
        catch(Throwable $e)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'errors' => $e->getMessage(),
                'data' => null,
                'message' => 'Error al eliminar la Bitácora',
            ]);
        }
    }

    public function show($id): JsonResponse
    {
        try
        {
            $visit = Visit::with('house', 'user')->find($id);

            if(!$visit)
            {
                return response()->json([
                    'status' => false,
                    'errors' => null,
                    'data' => null,
                    'message' => 'Bitácora no encontrada',
                ]);
            }

            $images = json_decode($visit->visit_images);

            $images_url = [];

            foreach($images as $image)
            {
                $images_url[] = Storage::disk('public')->url('images_security/' . $image);
            }

            $visit->visit_images = $images_url;


            $person = [];
            $vehicle = [];

            $client = new \GuzzleHttp\Client(['verify' => false]);

            $responseVehicle = $client->request('GET', 'https://messaging.sjbdevsoftcloud.com/api/data/vehicle/' . $visit->vehicle_plate);

            if($responseVehicle->getStatusCode() == 200)
            {
                $dataVehicle = json_decode($responseVehicle->getBody(), true);

                $vehicle = [
                    'type' => $dataVehicle['data']['type'],
                    'plate' => $dataVehicle['data']['plate'],
                    'model' => $dataVehicle['data']['model'],
                    'brand' => $dataVehicle['data']['brand'],
                    'service' => $dataVehicle['data']['service'],
                    'year' => $dataVehicle['data']['year'],
                    'registration_date' => $this->FormatDate($dataVehicle['data']['registration_date']),
                ];
            }
            else
            {
                $vehicle = false;
            }

            $client = new \GuzzleHttp\Client(['verify' => false]);

            $responsePerson = $client->request('GET', 'https://messaging.sjbdevsoftcloud.com/api/data/person/' . $visit->visitor_id);

            if($responsePerson->getStatusCode() == 200)
            {
                $dataPerson = json_decode($responsePerson->getBody(), true);

                $person = [
                    'ci' => $dataPerson['data']['ci'],
                    'name' => $dataPerson['data']['name'],
                ];
            }
            else
            {
                $person = false;
            }

            $data = [
                'visit' => $visit,
                'person' => $person,
                'vehicle' => $vehicle,
            ];

            return response()->json([
                'status' => true,
                'errors' => null,
                'data' => $data,
                'message' => 'Bitácora obtenida correctamente',
            ]);
        }
        catch(Throwable $e)
        {
            return response()->json([
                'status' => false,
                'errors' => $e->getMessage(),
                'data' => null,
                'message' => 'Error al obtener la Bitácora',
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

    public function list(Request $request): JsonResponse
    {
        $user = Auth::user();
        $complex_id = $request->session()->get('complex_id');

        $query = Visit::with('house', 'user', 'house.complex')
            ->where(function($query) use ($request) {
                $query->where('visit_date', 'like', '%' . $request->search . '%')
                    ->orWhere('visit_time', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhere('vehicle_plate', 'like', '%' . $request->search . '%')
                    ->orWhere('visitor_id', 'like', '%' . $request->search . '%')
                    ->orWhere('number_visitors', 'like', '%' . $request->search . '%')
                    ->orWhere('type_visit', 'like', '%' . $request->search . '%')
                    ->orWhere('house_id', 'like', '%' . $request->search . '%')
                    ->orWhereHas('house', function($query) use ($request) {
                        $query->where('number_house', 'like', '%' . $request->search . '%')
                            ->orWhere('owner_name', 'like', '%' . $request->search . '%')
                            ->orWhere('owner_surname', 'like', '%' . $request->search . '%')
                            ->orWhere('owner_phone', 'like', '%' . $request->search . '%')
                            ->orWhere('owner_email', 'like', '%' . $request->search . '%')
                            ->orWhereHas('complex', function ($query) use ($request) {
                                $query->where('name', 'like', '%' . $request->search . '%');
                            });
                    });
            })
            ->orderBy('id', 'desc');

        if ($user->hasRole('Guardia') && !$user->hasRole('Administrador'))
        {
            $query->where('user_id', $user->id);
        }

        if ($user->hasRole('Administrador') && !$user->hasRole('SuperAdministrador'))
        {
            $query->whereHas('house', function($query) use ($complex_id) {
                $query->where('complex_id', $complex_id);
            });
        }

        $visit = $query->paginate($request->size);

        return response()->json($visit);
    }

    public function UploadImages(Request $request): JsonResponse
    {
        try
        {
            $images = $request->file('visit_images');

            $images_names_original = $images->getClientOriginalName();

            $images_names = time() . '_' . $images_names_original;

            Storage::disk('public')->put('images_security/'. $images_names, File::get($images));


            return response()->json([
                'status' => true,
                'data' => $images_names,
                'message' => 'Imagenes subidas correctamente',
                'file_name' => $images_names,
            ]);
        }
        catch(Throwable $th)
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Error al subir las imagenes',
                'error' => $th->getMessage()
            ]);
        }
    }

    public function DeleteImages(Request $request): JsonResponse
    {
        try
        {
            $file_name = $request->getContent();

            $data = json_decode($file_name);

            $imagePath = 'images_security/' . $data->data;

            if (Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);

                return response()->json([
                    'status' => true,
                    'message' => 'Imagen eliminada correctamente',
                    'file_name' => $data->data,
                ]);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'La imagen no existe',
                ]);
            }
        } catch (Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => 'Error al eliminar la imagen',
                'error' => $th->getMessage(),
            ]);
        }
    }

    public function download(Request $request, $file)
    {
        if (!$file) {
            return response()->json(['error' => 'File not found'], 400);
        }

        $filename = 'visits/' . $file . '.pdf';

        if (!Storage::disk('r2')->exists($filename)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        return Storage::disk('r2')->download($filename);
    }
}

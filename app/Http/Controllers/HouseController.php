<?php

namespace App\Http\Controllers;

use App\Imports\HouseImport;
use Throwable;
use Inertia\Inertia;
use App\Models\House;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class HouseController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('House/Index', [
            'complexes' => DB::table('complexes')->select('id', 'name')->get()
        ]);
    }

    public function create(Request $request) : JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'complex_id' => 'required|integer',
            'number_house' => 'required|string',
            'owner_name' => 'required|string',
            'owner_surname' => 'required|string',
            'owner_email' => 'required|email',
            'owner_phone' => 'required|string|numeric|between:9,10',
            'owner_phone_2' => 'nullable|string|numeric|between:5,10',
        ], [
            'complex_id.required' => 'El conjunto es requerido',
            'complex_id.integer' => 'El conjunto debe ser un entero',
            'number_house.required' => 'El número de casa es requerido',
            'number_house.string' => 'El número de casa debe ser una cadena',
            'owner_name.required' => 'El nombre del propietario es requerido',
            'owner_name.string' => 'El nombre del propietario debe ser una cadena',
            'owner_surname.required' => 'El apellido del propietario es requerido',
            'owner_surname.string' => 'El apellido del propietario debe ser una cadena',
            'owner_email.required' => 'El correo electrónico del propietario es requerido',
            'owner_email.email' => 'El correo electrónico del propietario debe ser un correo electrónico válido',
            'owner_phone.required' => 'El teléfono del propietario es requerido',
            'owner_phone.string' => 'El teléfono del propietario debe ser una cadena',
            'owner_phone.numeric' => 'El teléfono del propietario debe ser un número',
            'owner_phone.between' => 'El teléfono del propietario debe tener entre 9 y 10 dígitos',
            'owner_phone_2.string' => 'El teléfono 2 del propietario debe ser una cadena',
            'owner_phone_2.numeric' => 'El teléfono 2 del propietario debe ser un número',
            'owner_phone_2.between' => 'El teléfono 2 del propietario debe tener entre 5 y 10 dígitos',
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

            House::create($validator->validated());

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Casa creada correctamente'
            ]);
        }
        catch (Throwable $th)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'La casa no pudo ser creada',
                'error' => $th->getMessage()
            ]);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'complex_id' => 'required|integer',
            'number_house' => 'required|string',
            'owner_name' => 'required|string',
            'owner_surname' => 'required|string',
            'owner_email' => 'required|email',
            'owner_phone' => 'required',
            'owner_phone_2' => 'nullable',
        ], [
            'complex_id.required' => 'El conjunto es requerido',
            'complex_id.integer' => 'El conjunto debe ser un entero',
            'number_house.required' => 'El número de casa es requerido',
            'number_house.string' => 'El número de casa debe ser una cadena',
            'owner_name.required' => 'El nombre del propietario es requerido',
            'owner_name.string' => 'El nombre del propietario debe ser una cadena',
            'owner_surname.required' => 'El apellido del propietario es requerido',
            'owner_surname.string' => 'El apellido del propietario debe ser una cadena',
            'owner_email.required' => 'El correo electrónico del propietario es requerido',
            'owner_email.email' => 'El correo electrónico del propietario debe ser un correo electrónico válido',
            'owner_phone.required' => 'El teléfono del propietario es requerido',
            'owner_phone.string' => 'El teléfono del propietario debe ser una cadena',
            'owner_phone.numeric' => 'El teléfono del propietario debe ser un número',
            'owner_phone.digits' => 'El teléfono del propietario debe tener 10 dígitos',
            'owner_phone_2.string' => 'El teléfono 2 del propietario debe ser una cadena',
            'owner_phone_2.numeric' => 'El teléfono 2 del propietario debe ser un número',
            'owner_phone_2.digits' => 'El teléfono 2 del propietario debe tener 10 dígitos',
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

            $house = House::find($id);

            if (!$house)
            {
                return response()->json([
                    'status' => false,
                    'data' => null,
                    'message' => 'La casa no existe'
                ]);
            }

            $house->update($validator->validated());

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Casa actualizada correctamente'
            ]);
        }
        catch (Throwable $th)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'La casa no pudo ser actualizada',
                'error' => $th->getMessage()
            ]);
        }
    }

    public function destroy($id): JsonResponse
    {
        try
        {
            DB::beginTransaction();

            $house = House::find($id);

            if (!$house)
            {
                return response()->json([
                    'status' => false,
                    'data' => null,
                    'message' => 'La casa no existe'
                ]);
            }

            $house->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Casa eliminada correctamente'
            ]);
        }
        catch (Throwable $th)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'La casa no pudo ser eliminada',
                'error' => $th->getMessage()
            ]);
        }
    }

    public function show($id): JsonResponse
    {
        try
        {
            $house = House::findOrFail($id);

            return response()->json([
                'status' => true,
                'data' => $house,
                'message' => 'Casa obtenida correctamente'
            ]);
        }
        catch (Throwable $th)
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'La casa no pudo ser obtenida',
                'error' => $th->getMessage()
            ]);
        }
    }

    public function list(Request $request): JsonResponse
    {
        $user = auth()->user();
        $complex_id = $request->session()->get('complex_id');

        $query = House::with('complex')
            ->where(function ($query) use ($request) {
                $query->where('number_house', 'like', '%' . $request->search . '%')
                    ->orWhere('owner_name', 'like', '%' . $request->search . '%')
                    ->orWhere('owner_surname', 'like', '%' . $request->search . '%')
                    ->orWhere('owner_email', 'like', '%' . $request->search . '%')
                    ->orWhere('owner_phone', 'like', '%' . $request->search . '%')
                    ->orWhereHas('complex', function ($query) use ($request) {
                        $query->where('name', 'like', '%' . $request->search . '%');
                    });
            });

        if($user->hasRole('Administrador') && !$user->hasRole('SuperAdministrador'))
        {
            $query->where('complex_id', $complex_id);
        }

        $houses = $query->paginate($request->size);

        return response()->json($houses);
    }

    public function select(Request $request): JsonResponse
    {
        $complex_id = $request->id;

        if($request->search == '')
        {
            $house = House::select('id', 'number_house', 'owner_name', 'owner_surname')
                ->where('complex_id', $complex_id)
                ->limit(15)
                ->get();
        }
        else
        {
             $house = House::select('id', 'number_house', 'owner_name', 'owner_surname')
                ->where('complex_id', $complex_id)
                ->where(function ($query) use ($request) {
                    $search = $request->search;
                    $query->where('number_house', 'like', '%' . $search . '%')
                        ->orWhere('owner_name', 'like', '%' . $search . '%')
                        ->orWhere('owner_surname', 'like', '%' . $search . '%');
                })
                ->limit(15)
                ->get();
        }

        foreach ($house as $item)
        {
            $item->value = $item->id;
            $item->label = $item->number_house.' - '.$item->owner_name.' '.$item->owner_surname;
        }

        return response()->json($house);
    }

    public function import(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx,xls',
            'complex_id' => 'required|integer',
        ], [
            'file.required' => 'El archivo es requerido',
            'file.file' => 'El archivo debe ser un archivo',
            'file.mimes' => 'El archivo debe ser de tipo xlsx o xls',
            'complex_id.required' => 'El conjunto es requerido',
            'complex_id.integer' => 'El conjunto debe ser un entero',
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
            $file = $request->file('file');
            $complex_id = $request->complex_id;

            \Excel::import(new HouseImport($complex_id), $file);

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Las casas fueron importadas correctamente'
            ]);
        }
        catch (Throwable $th)
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Las casas no pudieron ser importadas',
                'error' => $th->getMessage()
            ]);
        }

    }
}

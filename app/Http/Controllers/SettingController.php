<?php

namespace App\Http\Controllers;

use Throwable;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Setting/Index');
    }

    public function create(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'complex_id' => 'required|integer',
            'direction_ip' => 'required|string',
            'is_active' => 'required|boolean',
            'cameras_number' => 'required|integer|between:1,4',
        ], [
            'complex_id.required' => 'El conjunto es requerido',
            'complex_id.integer' => 'El conjunto debe ser un entero',
            'direction_ip.required' => 'La dirección IP es requerida',
            'direction_ip.string' => 'La dirección IP debe ser una cadena',
            'is_active.required' => 'El estado es requerido',
            'cameras_number.required' => 'El número de cámaras es requerido',
            'cameras_number.integer' => 'El número de cámaras debe ser un entero',
            'cameras_number.between' => 'El número de cámaras debe estar entre 1 y 4',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $validator->errors()
            ]);
        }

        try {
            DB::beginTransaction();

            Setting::create($validator->validated());

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Se ha creado el registro correctamente'
            ]);
        }
        catch (Throwable $th)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $th->getMessage(),
                'message' => 'Ha ocurrido un error al crear el registro'
            ]);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'complex_id' => 'required|integer',
            'direction_ip' => 'required|string',
            'is_active' => 'required|boolean',
            'cameras_number' => 'required|integer|between:1,4',
        ], [
            'complex_id.required' => 'El conjunto es requerido',
            'complex_id.integer' => 'El conjunto debe ser un entero',
            'direction_ip.required' => 'La dirección IP es requerida',
            'direction_ip.string' => 'La dirección IP debe ser una cadena',
            'is_active.required' => 'El estado es requerido',
            'cameras_number.required' => 'El número de cámaras es requerido',
            'cameras_number.integer' => 'El número de cámaras debe ser un entero',
            'cameras_number.between' => 'El número de cámaras debe estar entre 1 y 4',
        ]);

        if($validator->fails()) {
            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $validator->errors()
            ]);
        }

        try {
            DB::beginTransaction();

            $setting = Setting::findOrFail($id);

            $setting->update($validator->validated());

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Se ha actualizado el registro correctamente'
            ]);
        }
        catch (Throwable $th)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $th->getMessage(),
                'message' => 'Ha ocurrido un error al actualizar el registro'
            ]);
        }
    }

    public function destroy($id): JsonResponse
    {
        try
        {
            DB::beginTransaction();

            $setting = Setting::findOrFail($id);

            $setting->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Se ha eliminado el registro correctamente'
            ]);
        }
        catch (Throwable $th)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $th->getMessage(),
                'message' => 'Ha ocurrido un error al eliminar el registro'
            ]);
        }
    }

    public function show($id): JsonResponse
    {
        try
        {
            $setting = Setting::findOrFail($id);

            return response()->json([
                'status' => true,
                'data' => $setting,
                'message' => 'Se ha obtenido el registro correctamente'
            ]);
        }
        catch (Throwable $th)
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $th->getMessage(),
                'message' => 'Ha ocurrido un error al obtener el registro'
            ]);
        }
    }

    public function list(Request $request): JsonResponse
    {
        if($request->search == '')
        {
            $setting = Setting::with('complex')->paginate($request->size);
        }
        else
        {
            $setting = Setting::with('complex')
                ->where('port', 'like', '%'.$request->search.'%')
                ->orWhere('direction_ip', 'like', '%'.$request->search.'%')
                ->orWhere('user', 'like', '%'.$request->search.'%')
                ->orWhereHas('complex', function($query) use($request) {
                    $query->where('name', 'like', '%'.$request->search.'%');
                })
                ->paginate($request->size);
        }

        return response()->json($setting);
    }
}

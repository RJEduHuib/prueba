<?php

namespace App\Http\Controllers;

use Throwable;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Complex;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class ComplexController extends Controller
{
    public function index() : Response
    {
        return Inertia::render('Complex/Index');
    }

    public function create(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'address' => 'required',
            'city' => 'required',
            'is_cameras' => 'nullable|boolean',
            'is_whatsapp' => 'nullable|boolean',
            'is_outomatisering' => 'nullable|boolean',
            'admin_email' => 'nullable|email',
            'company_id' => 'required|integer',
            'user_id' => 'required|integer',
        ], [
            'name.required' => 'El nombre es requerido',
            'address.required' => 'La dirección es requerida',
            'city.required' => 'La ciudad es requerida',
            'company_id.required' => 'La empresa es requerida',
            'company_id.integer' => 'La empresa debe ser un número entero',
            'user_id.required' => 'El usuario es requerido',
            'user_id.integer' => 'El usuario debe ser un número entero',
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

            Complex::create($validator->validated());

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Conjunto creado correctamente'
            ]);
        }
        catch (Throwable $th)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Ocurrió un error al crear el Conjunto'
            ]);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'is_cameras' => 'nullable|boolean',
            'is_whatsapp' => 'nullable|boolean',
            'is_outomatisering' => 'nullable|boolean',
            'admin_email' => 'nullable|email',
            'company_id' => 'nullable|integer',
            'user_id' => 'nullable|integer',
        ], [
            'name.required' => 'El nombre es requerido',
            'address.required' => 'La dirección es requerida',
            'city.required' => 'La ciudad es requerida',
            'company_id.required' => 'La empresa es requerida',
            'company_id.integer' => 'La empresa debe ser un número entero',
            'user_id.required' => 'El usuario es requerido',
            'user_id.integer' => 'El usuario debe ser un número entero',
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

            Complex::find($id)->update($validator->validated());

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Conjunto actualizado correctamente'
            ]);
        }
        catch (Throwable $th)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'error' => $th->getMessage(),
                'message' => 'Ocurrió un error al actualizar el Conjunto'
            ]);
        }
    }

    public function destroy($id): JsonResponse
    {
        try
        {
            DB::beginTransaction();

            Complex::find($id)->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Conjunto eliminado correctamente'
            ]);
        }
        catch (Throwable $th)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Ocurrió un error al eliminar el Conjunto'
            ]);
        }
    }

    public function show($id): JsonResponse
    {
        try
        {
            $complex = Complex::findOrFail($id);

            return response()->json([
                'status' => true,
                'data' => $complex,
                'message' => 'Conjunto obtenido correctamente'
            ]);
        }
        catch (Throwable $th)
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Ocurrió un error al obtener el Conjunto'
            ]);
        }
    }

    public function list(Request $request): JsonResponse
    {
        if($request->search == '')
        {
            $complex = Complex::paginate($request->perpage);
        }
        else
        {
            $complex = Complex::where('name', 'like', '%'.$request->search.'%')
                ->orWhere('address', 'like', '%'.$request->search.'%')
                ->orWhere('city', 'like', '%'.$request->search.'%')
                ->paginate($request->perpage);
        }

        return response()->json($complex);
    }

    public function select(Request $request): JsonResponse
    {
        if($request->search == '')
        {
            if($request->id != null)
            {
                $complex = Complex::select('id', 'name', 'address')
                    ->whereNotIn('id', function($query) use ($request) {
                        $query->select('complex_id')->from('settings')->where('id', '!=', $request->id);
                    })
                    ->limit(15)
                    ->get();
            }
            else
            {
                $complex = Complex::select('id', 'name', 'address')
                    ->whereNotIn('id', function($query) {
                        $query->select('complex_id')->from('settings');
                    })
                    ->limit(15)
                    ->get();
            }
        }
        else
        {
            if($request->id != null)
            {
                $complex = Complex::select('id', 'name', 'address')
                    ->whereNotIn('id', function($query) use ($request) {
                        $query->select('complex_id')->from('settings')->where('id', '!=', $request->id);
                    })
                    ->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('address', 'like', '%'.$request->search.'%')
                    ->limit(15)
                    ->get();
            }
            else
            {
                $complex = Complex::select('id', 'name', 'address')
                    ->whereNotIn('id', function($query) {
                        $query->select('complex_id')->from('settings');
                    })
                    ->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('address', 'like', '%'.$request->search.'%')
                    ->limit(15)
                    ->get();
            }
        }

        foreach ($complex as $item)
        {
            $item->value = $item->id;
            $item->label = $item->name;
        }

        return response()->json($complex);
    }

    public function select_list(Request $request): JsonResponse
    {
        if($request->search == '')
        {
            $complex = Complex::select('id', 'name', 'address')
                ->limit(15)
                ->get();
        }
        else
        {
            $complex = Complex::select('id', 'name', 'address')
                ->where('name', 'like', '%'.$request->search.'%')
                ->orWhere('address', 'like', '%'.$request->search.'%')
                ->limit(15)
                ->get();
        }

        foreach ($complex as $item)
        {
            $item->value = $item->id;
            $item->label = $item->name;
        }

        return response()->json($complex);
    }

    public function complex_info(Request $request) : JsonResponse
    {
        $complex = Complex::select('is_cameras')->where('id', $request->id)->first();

        $complex_ip = Setting::select('direction_ip', 'cameras_number')->where('complex_id', $request->id)->first();

        if($complex)
        {
            return response()->json([
                'status' => true,
                'data' => $complex,
                'complex_ip' => $complex_ip,
                'message' => 'Conjunto obtenido correctamente'
            ]);
        }
        else
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Ocurrió un error al obtener el Conjunto'
            ]);
        }
    }
}

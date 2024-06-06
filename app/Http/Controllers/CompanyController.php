<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Throwable;

class CompanyController extends Controller
{
    public function index(): \Inertia\Response
    {
        return Inertia::render('Company/Index');
    }

    public function show($id): JsonResponse
    {
        try
        {
            $company = Company::findOrFail($id);

            return response()->json([
                'status' => true,
                'data' => $company,
                'message' => 'Empresa obtenida correctamente'
            ]);
        }
        catch (Throwable $th)
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Ocurrió un error al obtener la empresa'
            ]);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'description' => 'required',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ], [
            'name.required' => 'Name is required',
            'description.required' => 'Description is required',
            'logo.image' => 'Logo must be an image',
            'logo.mimes' => 'Logo must be a file of type: jpeg, png, jpg, gif, svg',
            'logo.max' => 'Logo may not be greater than 2048 kilobytes',
        ]);

        if ($validator->fails())
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $validator->errors()
            ]);
        }

        \DB::beginTransaction();
        try
        {
            $company = Company::findOrFail($id);
            $company->name = $request->name;
            $company->description = $request->description;

            if ($request->hasFile('logo'))
            {
                \Storage::delete('public/' . $company->logo);

                $path = $request->file('logo')->store('public/logos');
                $company->logo = str_replace('public/', '', $path);
            }

            $company->save();

            \DB::commit();
            return response()->json([
                'status' => true,
                'data' => $company,
                'message' => 'Empresa actualizada correctamente'
            ]);
        }
        catch (\Throwable $th) {
            \DB::rollBack();
            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $th->getMessage(),
                'message' => 'Error al actualizar la empresa'
            ]);
        }
    }

    public function destroy($id): JsonResponse
    {
        try
        {
            DB::beginTransaction();

            Company::find($id)->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Empresa eliminada correctamente'
            ]);
        }
        catch (Throwable $th)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Ocurrió un error al eliminar la empresa'
            ]);
        }
    }

    public function create(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'description' => 'required',
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ], [
            'name.required' => 'Name is required',
            'description.required' => 'Description is required',
            'logo.required' => 'Logo is required',
            'logo.image' => 'Logo must be an image',
            'logo.mimes' => 'Logo must be a file of type: jpeg, png, jpg, gif, svg',
            'logo.max' => 'Logo may not be greater than 2048 kilobytes',
        ]);

        if ($validator->fails())
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $validator->errors()
            ]);
        }

        \DB::beginTransaction();
        try
        {
            $path = $request->file('logo')->store('public/logos');

            $company = Company::create([
                'name' => $request->name,
                'description' => $request->description,
                'logo' => str_replace('public/', '', $path),
            ]);

            \DB::commit();
            return response()->json([
                'status' => true,
                'data' => $company,
                'message' => 'Empresa creada correctamente'
            ]);
        }
        catch (\Throwable $th) {
            \DB::rollBack();
            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $th->getMessage(),
                'message' => 'Error al crear la empresa'
            ]);
        }
    }

    public function select(Request $request): JsonResponse
    {
        $complex = Company::select('id', 'name')
            ->where('name', 'like', '%'.$request->search.'%')
            ->limit(15)
            ->get();

        foreach ($complex as $item)
        {
            $item->value = $item->id;
            $item->label = $item->name;
        }

        return response()->json($complex);
    }

    public function list(Request $request): \Illuminate\Http\JsonResponse
    {
        $company = Company::where('name', 'like', "%{$request->search}%")
            ->orderBy('name', 'asc')
            ->paginate($request->perpage);

        return response()->json($company);
    }
}

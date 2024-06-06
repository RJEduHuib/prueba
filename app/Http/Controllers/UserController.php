<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('User/Index');
    }

    public function create(Request $request) : JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'ci' => 'required|string|max:10|unique:users',
            'phone' => 'required|string|max:10|unique:users',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'roles' => 'required|array',
            'roles.*' => 'required|string|exists:roles,name',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'name.required' => 'El nombre es requerido',
            'surname.required' => 'El apellido es requerido',
            'ci.required' => 'La cédula es requerida',
            'ci.unique' => 'La cédula ya existe',
            'phone.required' => 'El teléfono es requerido',
            'phone.unique' => 'El teléfono ya existe',
            'address.required' => 'La dirección es requerida',
            'city.required' => 'La ciudad es requerida',
            'email.required' => 'El correo electrónico es requerido',
            'email.unique' => 'El correo electrónico ya existe',
            'email.email' => 'El correo electrónico no es válido',
            'roles.required' => 'El rol es requerido',
            'roles.*.required' => 'El rol es requerido',
            'password.required' => 'La contraseña es requerida',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres',
            'password.confirmed' => 'Las contraseñas no coinciden',
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

            User::create($validator->validated())->assignRole($request->roles);

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Usuario creado correctamente'
            ]);
        }
        catch(\Throwable $th)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'No se pudo crear el usuario'
            ]);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'ci' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users,email,'.$id,
            'roles' => 'nullable|array',
            'roles.*' => 'nullable|string|exists:roles,name',
            'password' => 'nullable|string|min:8',
        ], [
            'name.required' => 'El nombre es requerido',
            'surname.required' => 'El apellido es requerido',
            'ci.required' => 'La cédula es requerida',
            'phone.required' => 'El teléfono es requerido',
            'address.required' => 'La dirección es requerida',
            'city.required' => 'La ciudad es requerida',
            'email.required' => 'El correo electrónico es requerido',
            'email.unique' => 'El correo electrónico ya existe',
            'roles.required' => 'El rol es requerido',
            'roles.*.required' => 'El rol es requerido',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres',
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

            $user = User::findOrFail($id);

            $user->update($validator->validated());

            $user->syncRoles($request->roles);

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Usuario actualizado correctamente'
            ]);
        }
        catch(\Throwable $th)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'No se pudo actualizar el usuario'
            ]);
        }
    }

    public function destroy($id): JsonResponse
    {
        try
        {
            DB::beginTransaction();

            $user = User::findOrFail($id);

            $user->active = 0;

            $user->save();

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Usuario eliminado correctamente'
            ]);
        }
        catch(\Throwable $th)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'No se pudo eliminar el usuario'
            ]);
        }
    }

    public function show($id): JsonResponse
    {
        try
        {
            $user = User::findOrFail($id);

            $user->roles = $user->roles()->pluck('name');

            return response()->json([
                'status' => true,
                'data' => $user,
                'message' => 'Usuario encontrado'
            ]);

        }
        catch (\Throwable $th)
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'No se encontró el usuario'
            ]);
        }
    }

    public function list(Request $request): JsonResponse
    {
        if($request->search == '')
        {
            $users = User::where('active',1 )->paginate($request->size);
        }
        else
        {
            $users = User::where('active', 1)
                ->where(function($query) use ($request) {
                    $query->where('name', 'like', '%'.$request->search.'%')
                        ->orWhere('surname', 'like', '%'.$request->search.'%')
                        ->orWhere('ci', 'like', '%'.$request->search.'%')
                        ->orWhere('phone', 'like', '%'.$request->search.'%')
                        ->orWhere('address', 'like', '%'.$request->search.'%')
                        ->orWhere('city', 'like', '%'.$request->search.'%')
                        ->orWhere('email', 'like', '%'.$request->search.'%')
                        ->orWhereHas('roles', function($q) use ($request) {
                            $q->where('name', 'like', '%'.$request->search.'%');
                        });
                })
                ->paginate($request->size);
        }

        return response()->json($users);
    }

    public function select(Request $request): JsonResponse
    {
        $search = $request->search;

        $users = User::select('email')
            ->where('active', 1)
            ->where(function ($query) use ($search) {
                $query->where('email', 'like', '%'.$search.'%');
            })
            ->limit(5)
            ->get();

        foreach($users as $user)
        {
            $user->value = $user->email;
            $user->label = $user->email;
        }

        return response()->json($users);
    }

    public function select_user(Request $request): JsonResponse
    {
        $search = $request->search;

        $users = User::select('id', 'name', 'surname', 'email')
            ->where('active', 1)
            ->where(function ($query) use ($search) {
                $query->where('name', 'like', '%'.$search.'%')
                    ->orWhere('surname', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%');
            })
            ->limit(5)
            ->get();

        foreach($users as $user)
        {
            $user->value = $user->id;
            $user->label = $user->name . ' ' . $user->surname . ' - ' . $user->email;
        }

        return response()->json($users);
    }
}

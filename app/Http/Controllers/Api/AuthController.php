<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ], [
            'email.required' => 'El email es requerido',
            'email.email' => 'El email debe ser un email valido',
            'password.required' => 'La contraseña es requerida'
        ]);

        if(!$validated)
        {
            return response()->json([
                'status' => false,
                'message' => 'Error de validacion',
                'errors' => $validated->errors()
            ], 200);
        }

        if(Auth::attempt($request->only('email', 'password')))
        {
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => true,
                'message' => 'Usuario logueado correctamente',
                'data' => [
		            'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'surname' => $user->surname,
                        'ci' => $user->ci,
                        'phone' => $user->phone,
                        'address' => $user->address,
                        'city' => $user->city,
                        'email' => $user->email,
                        'roles' => $user->getRoleNames(),
                        'profile_photo_url' => "https://ui-avatars.com/api/?name={$user->name}+{$user->surname}&color=FFFFFF&background=000000",
                    ],
                    'token' => $token,
		        ]
            ], 200);
        }
        else
        {
            return response()->json([
                'status' => false,
                'message' => 'Usuario o contraseña incorrectos',
                'data' => null,
            ], 200);
        }
    }

    public function checkToken(Request $request) : JsonResponse
    {   
        $user = $request->user();

        if($user)
        {
            return response()->json([
                'status' => true,
                'message' => 'Token valido',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'surname' => $user->surname,
                        'ci' => $user->ci,
                        'phone' => $user->phone,
                        'address' => $user->address,
                        'city' => $user->city,
                        'email' => $user->email,
                        'roles' => $user->getRoleNames(),
                        'profile_photo_url' => "https://ui-avatars.com/api/?name={$user->name}+{$user->surname}&color=FFFFFF&background=000000",
                    ],
                    'token' => $request->bearerToken(),
                ]
            ], 200);
        }
        else
        {
            return response()->json([
                'status' => false,
                'message' => 'Token invalido',
                'data' => null,
            ], 200);
        }
    }

    public function update_fcm_token(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fcm_token' => 'required'
        ], [
            'fcm_token.required' => 'El token es requerido'
        ]);

        if(!$validated)
        {
            return response()->json([
                'status' => false,
                'message' => 'Error de validacion',
                'errors' => $validated->errors()
            ], 200);
        }

        try
        {
            DB::beginTransaction();

            $user = $request->user();

            $user->fcm_token = $request->fcm_token;

            $user->save();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Token actualizado correctamente',
                'data' => null,
            ], 200);
        }
        catch(Exception $e)
        {
            return response()->json([
                'status' => false,
                'message' => 'Error al actualizar el token',
                'data' => null,
            ], 200);
        }
    }

    public function logout(Request $request): JsonResponse
    {   
        $request->user()->tokens()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Usuario deslogueado correctamente'
        ], 200);
    }


    public function auth_config(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ], [
            'email.required' => 'El email es requerido',
            'email.email' => 'El email debe ser un email valido',
            'password.required' => 'La contraseña es requerida'
        ]);

        if($validator->fails())
        {
            return response()->json([
                'status' => false,
                'message' => 'Error de validacion',
                'errors' => $validator->errors()
            ], 200);
        }


        if(Auth::attempt($request->only('email', 'password')))
        {
            $user = Auth::user();

            if($user->hasRole('Administrador'))
            {
                $token = $user->createToken('auth_token')->plainTextToken;

                return response()->json([
                    'status' => true,
                    'message' => 'Usuario logueado correctamente',
                    'data' => [
                        'user' => [
                            'id' => $user->id,
                            'name' => $user->name,
                            'surname' => $user->surname,
                            'ci' => $user->ci,
                            'phone' => $user->phone,
                            'address' => $user->address,
                            'city' => $user->city,
                            'email' => $user->email,
                            'roles' => $user->getRoleNames(),
                            'profile_photo_url' => "https://ui-avatars.com/api/?name={$user->name}+{$user->surname}&color=FFFFFF&background=000000",
                        ],
                        'token' => $token,
                    ]
                ], 200);
            }
            else
            {
                return response()->json([
                    'status' => false,
                    'message' => 'Lo sentimos, no tienes permisos para acceder a esta seccion',
                    'data' => null,
                ], 200);
            }
        }
        else
        {
            return response()->json([
                'status' => false,
                'message' => 'Usuario o contraseña incorrectos',
                'data' => null,
            ], 200);
        }


    }
}

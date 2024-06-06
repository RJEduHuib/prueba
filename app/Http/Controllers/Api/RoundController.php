<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class RoundController extends Controller
{
    public function register_round(Request $request)
    {
        $validated = $request->validate([
            'round_id' => 'required',
            'user_id' => 'required',
            'start_date' => 'required',
            'start_time' => 'required',
            'latitude' => 'required',
            'longitude' => 'required',
        ], [
            'round_id.required' => 'El id de la ronda es requerido',
            'user_id.required' => 'El id del usuario es requerido',
            'start_date.required' => 'La fecha de inicio es requerida',
            'start_time.required' => 'La hora de inicio es requerida',
            'latitude.required' => 'La latitud es requerida',
            'longitude.required' => 'La longitud es requerida',
        ]);

        if(!$validated)
        {
            return response()->json([
                'status' => false,
                'message' => 'Error de validacion',
                'errors' => $validated->errors()
            ], 200);
        }

        $round_register = RoundRegister::create([
            'round_id' => $request->round_id,
            'user_id' => $request->user_id,
            'start_date' => $request->start_date,
            'start_time' => $request->start_time,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        if($round_register)
        {
            return response()->json([
                'status' => true,
                'message' => 'Ronda registrada correctamente',
                'data' => $round_register
            ], 200);
        }
        else
        {
            return response()->json([
                'status' => false,
                'message' => 'Error al registrar la ronda',
                'data' => null
            ], 200);
        }
    }
}

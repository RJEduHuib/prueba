<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class VisitController extends Controller
{
    public function update_state(Request $request)
    {
        $validated = $request->validate([
            'visit_id' => 'required',
        ], [
            'visit_id.required' => 'El id de la visita es requerido',
        ]);

        if(!$validated)
        {
            return response()->json([
                'status' => false,
                'message' => 'Error de validacion',
                'errors' => $validated->errors()
            ], 200);
        }

        $visit = Visit::find($request->visit_id);

        if($visit)
        {
            $visit->state = "Realizada";
            $visit->save();

            return response()->json([
                'status' => true,
                'message' => 'Estado de la visita actualizado correctamente',
                'data' => $visit
            ], 200);
        }
        else
        {
            return response()->json([
                'status' => false,
                'message' => 'Error al actualizar el estado de la visita',
                'data' => null
            ], 200);
        }
    }
}

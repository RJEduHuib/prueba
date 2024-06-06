<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Complex;
use App\Events\PanicEvent;
use App\Models\PanicAlert;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PanicAlertController extends Controller
{
    public function send_event(Request $request, $id): JsonResponse
    {
        DB::beginTransaction();
        try
        {
            $complex = Complex::find($id);
            $user = Auth::user();
            $type = $request->type;

            $date_convert = date('Y-m-d', strtotime($request->date));

            $alert = PanicAlert::create([
                'user_id' => $user->id,
                'time_alerted' => $request->time,
                'date_alerted' => $date_convert,
                'complex_id' => $complex->id,
            ]);

            $data = [
                'complex_id' => $complex->id,
                'complex' => $complex,
                'user' => $user,
                'type' => $type,
                'info' => $alert,
            ];

            broadcast(new PanicEvent($data))->toOthers();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Se ha enviado la alerta de pánico.',
            ]);
        }
        catch(Exception $e)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'error' => $e->getMessage(),
                'message' => 'No se ha podido enviar la alerta de pánico.',
            ]);
        }
    }

    public function show(Request $request, $id): JsonResponse
    {
        $alert = PanicAlert::with('user')
                ->with('complex')
                ->find($id);

        return response()->json($alert);
    }

    public function list(Request $request, $id) : JsonResponse
    {
        $user = Auth::user();

        $search = $request->search;
        $size = $request->size;

        if($user->hasRole('Administrador'))
        {
            if($search != '')
            {
                $alerts = PanicAlert::with('user')
                        ->with('complex')
                        ->where(function($query) use ($search)
                        {
                            $query->where('time_alerted', 'like', '%' . $search . '%')
                                ->orWhere('date_alerted', 'like', '%' . $search . '%')
                                ->orWhere('type', 'like', '%' . $search . '%')
                                ->orWhereHas('user', function($query) use ($search)
                                {
                                    $query->where('name', 'like', '%' . $search . '%')
                                        ->orWhere('surname', 'like', '%' . $search . '%')
                                        ->orWhere('email', 'like', '%' . $search . '%')
                                        ->orWhere('phone', 'like', '%' . $search . '%');
                                })
                                ->orWhereHas('complex', function($query) use ($search)
                                {
                                    $query->where('name', 'like', '%' . $search . '%')
                                        ->orWhere('address', 'like', '%' . $search . '%');
                                });
                        })
                        ->paginate($size);
            }
            else
            {
                $alerts = PanicAlert::with('user')
                        ->with('complex')
                        ->paginate($size);
            }
        }
        else
        {
            if($search != '')
            {
                $alerts = PanicAlert::with('user')
                        ->with('complex')
                        ->where('complex_id', $id)
                        ->where(function($query) use ($search)
                        {
                            $query->where('time_alerted', 'like', '%' . $search . '%')
                                ->orWhere('date_alerted', 'like', '%' . $search . '%')
                                ->orWhere('type', 'like', '%' . $search . '%')
                                ->orWhereHas('user', function($query) use ($search)
                                {
                                    $query->where('name', 'like', '%' . $search . '%')
                                        ->orWhere('surname', 'like', '%' . $search . '%')
                                        ->orWhere('email', 'like', '%' . $search . '%')
                                        ->orWhere('phone', 'like', '%' . $search . '%');
                                })
                                ->orWhereHas('complex', function($query) use ($search)
                                {
                                    $query->where('name', 'like', '%' . $search . '%')
                                        ->orWhere('address', 'like', '%' . $search . '%');
                                });
                        })
                        ->paginate($size);
            }
            else
            {
                $alerts = PanicAlert::with('user')
                        ->with('complex')
                        ->where('complex_id', $id)
                        ->paginate($size);
            }
        }

        return response()->json($alerts);
    }
}

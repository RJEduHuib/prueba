<?php

namespace App\Http\Controllers;

use Throwable;
use Illuminate\Http\Request;
use App\Models\RoundRegister;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class RoundRegisterController extends Controller
{
    public function create(Request $request, $id) : JsonResponse
    {
        DB::beginTransaction();
        try
        {   
            RoundRegister::create([
                'round_id' => $id,
                'user_id' => Auth::user()->id,
                'date_registered' => date('Y-m-d'),
                'time_registered' => date('H:i:s'),
                'description' => $request->description
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'errors' => null,
                'message' => 'Se ha registrado el control de la ronda correctamente' 
            ]);
        }
        catch(Throwable $th)
        {


            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $th->getMessage(),
                'message' => 'Ha ocurrido un error al registrar el control de la ronda'
            ]);
        }
    }

    public function show(Request $request): JsonResponse
    {
        try 
        {
            $round = RoundRegister::with('user', 'round.complex')->findOrFail($request->id);
          
            if($round)
            {
                return response()->json([
                    'status' => true,
                    'data' => $round,
                    'errors' => null,
                    'message' => 'Se encontró el registro'
                ]);
            }
            else
            {
                return response()->json([
                    'status' => false,
                    'data' => null,
                    'errors' => null,
                    'message' => 'No se encontró el registro'
                ]);
            }
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
        $user = Auth::user();

        $search = $request->search;
        $size = $request->size;

        if ($user->hasRole('Administrador')) 
        {
            if($search != '')
            {
                $registers = $user->roundRegisters()
                            ->with('round.complex')
                            ->with('user')
                            ->where(function ($query) use ($search) 
                            {
                                $query->where('time_registered', 'like', '%' . $search . '%')
                                    ->orWhere('date_registered', 'like', '%' . $search . '%')
                                    ->orWhereHas('user', function ($query) use ($search) {
                                        $query->where('name', 'like', '%' . $search . '%')
                                            ->orWhere('surname', 'like', '%' . $search . '%')
                                            ->orWhere('email', 'like', '%' . $search . '%')
                                            ->orWhere('phone', 'like', '%' . $search . '%')
                                            ->orWhere('ci', 'like', '%' . $search . '%');
                                    })
                                    ->orWhereHas('round.complex', function ($query) use ($search) {
                                        $query->where('name', 'like', '%' . $search . '%');
                                    });
                            })
                            ->paginate($size);
            }
            else
            {
                $registers = $user->roundRegisters()
                            ->with('round.complex')
                            ->with('user')
                            ->paginate($size);
            }
        } 
        else 
        {
            if($search != '')
            {
                $registers = $user->roundRegisters()
                            ->with('round.complex')
                            ->with('user')
                            ->where('user_id', $user->id)
                            ->where(function ($query) use ($search) 
                            {
                                $query->where('time_registered', 'like', '%' . $search . '%')
                                    ->orWhere('date_registered', 'like', '%' . $search . '%')
                                    ->orWhereHas('user', function ($query) use ($search) {
                                        $query->where('name', 'like', '%' . $search . '%')
                                            ->orWhere('surname', 'like', '%' . $search . '%')
                                            ->orWhere('email', 'like', '%' . $search . '%')
                                            ->orWhere('phone', 'like', '%' . $search . '%')
                                            ->orWhere('ci', 'like', '%' . $search . '%');
                                    })
                                    ->orWhereHas('round.complex', function ($query) use ($search) {
                                        $query->where('name', 'like', '%' . $search . '%');
                                    });
                            })
                            ->paginate($size);
            }
            else
            {
                $registers = $user->roundRegisters()
                            ->with('round.complex')
                            ->with('user')
                            ->where('user_id', $user->id)
                            ->paginate($size);
            }
        }

        return response()->json($registers);
    }

    public function list_rounds(Request $request, $id): JsonResponse
    {
        $user = Auth::user();

        $search = $request->search;
        $size = $request->size;

        if($user->hasRole('Administrador'))
        {
            if($search != '')
            {
                $registers = RoundRegister::with('round.complex')
                            ->with('user')
                            ->where(function ($query) use ($search) 
                            {
                                $query->where('time_registered', 'like', '%' . $search . '%')
                                    ->orWhere('date_registered', 'like', '%' . $search . '%')
                                    ->orWhereHas('user', function ($query) use ($search) {
                                        $query->where('name', 'like', '%' . $search . '%')
                                            ->orWhere('surname', 'like', '%' . $search . '%')
                                            ->orWhere('email', 'like', '%' . $search . '%')
                                            ->orWhere('phone', 'like', '%' . $search . '%')
                                            ->orWhere('ci', 'like', '%' . $search . '%');
                                    })
                                    ->orWhereHas('round.complex', function ($query) use ($search) {
                                        $query->where('name', 'like', '%' . $search . '%')
                                            ->orWhere('description', 'like', '%' . $search . '%');
                                    });
                            })
                            ->paginate($size);
            }
            else
            {
                $registers = RoundRegister::with('round.complex')
                            ->with('user')
                            ->paginate($size);
            }
        }
        else
        {
            if($search != '')
            {
                $registers = RoundRegister::with('round.complex')
                            ->with('user')
                            ->whereHas('round', function ($query) use ($id) {
                                $query->where('complex_id', $id);
                            })
                            ->where(function ($query) use ($search) 
                            {
                                $query->where('time_registered', 'like', '%' . $search . '%')
                                    ->orWhere('date_registered', 'like', '%' . $search . '%')
                                    ->orWhereHas('user', function ($query) use ($search) {
                                        $query->where('name', 'like', '%' . $search . '%')
                                            ->orWhere('surname', 'like', '%' . $search . '%')
                                            ->orWhere('email', 'like', '%' . $search . '%')
                                            ->orWhere('phone', 'like', '%' . $search . '%')
                                            ->orWhere('ci', 'like', '%' . $search . '%');
                                    })
                                    ->orWhereHas('round.complex', function ($query) use ($search) {
                                        $query->where('name', 'like', '%' . $search . '%');
                                    });
                            })
                            ->paginate($size);
            }
            else
            {
                $registers = RoundRegister::with('round.complex')
                            ->with('user')
                            ->whereHas('round', function ($query) use ($id) {
                                $query->where('complex_id', $id);
                            })
                            ->paginate($size);
            }
        }

        return response()->json($registers);
    }
}

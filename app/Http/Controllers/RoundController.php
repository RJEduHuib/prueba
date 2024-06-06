<?php

namespace App\Http\Controllers;

use Throwable;
use Inertia\Inertia;
use App\Models\Round;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class RoundController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Round/Index');
    }

    public function create(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required',
            'longitude' => 'required',
            'complex_id' => 'required|integer',
        ], [
            'latitude.required' => 'La latitud es requerida',
            'longitude.required' => 'La longitud es requerida',
            'complex_id.required' => 'El complejo es requerido',
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

            $round = Round::create([
                'latitude' => $request->input('latitude'),
                'longitude' => $request->input('longitude'),
                'complex_id' => $request->input('complex_id'),
            ]);

            $qrCodeData = $round->id;


            $qrCode = QrCode::format('png')->size(500)->generate($qrCodeData);

            $filename = 'round_' . time() . '.png';

            Storage::disk('public')->put('qrcodes/' . $filename, $qrCode);

            $round->update([
                'qr_code' => $filename,
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Ronda creada exitosamente'
            ]);
        }
        catch(Throwable $e)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $e->getMessage(),
                'message' => 'La ronda no pudo ser creada'
            ]);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required',
            'longitude' => 'required',
            'complex_id' => 'required|integer',
        ], [
            'latitude.required' => 'La latitud es requerida',
            'longitude.required' => 'La longitud es requerida',
            'complex_id.required' => 'El complejo es requerido',
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

            $round = Round::find($id);

            $round->update([
                'latitude' => $request->input('latitude'),
                'longitude' => $request->input('longitude'),
                'complex_id' => $request->input('complex_id'),
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Ronda actualizada exitosamente'
            ]);
        }
        catch(Throwable $e)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $e->getMessage(),
                'message' => 'La ronda no pudo ser actualizada'
            ]);
        }
    }

    public function destroy($id): JsonResponse
    {
        try
        {
            DB::beginTransaction();

            $round = Round::find($id);

            Storage::disk('public')->delete('qrcodes/' . $round->qr_code);

            $round->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Ronda eliminada exitosamente'
            ]);
        }
        catch(Throwable $e)
        {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $e->getMessage(),
                'message' => 'La ronda no pudo ser eliminada'
            ]);
        }
    }

    public function show($id): JsonResponse
    {
        try
        {
            $round = Round::find($id);

            $round->qr_code = Storage::disk('public')->url('qrcodes/' . $round->qr_code);

            if (!$round)
            {
                return response()->json([
                    'status' => false,
                    'data' => null,
                    'message' => 'La ronda no existe'
                ]);
            }

            return response()->json([
                'status' => true,
                'data' => $round,
                'message' => 'Ronda obtenida exitosamente'
            ]);
        }
        catch(Throwable $e)
        {
            return response()->json([
                'status' => false,
                'data' => null,
                'errors' => $e->getMessage(),
                'message' => 'La ronda no pudo ser obtenida'
            ]);
        }
    }

    public function list(Request $request): JsonResponse
    {
        $user = auth()->user();
        $complex_id = $request->session()->get('complex_id');

        $query =  $rounds = Round::with('complex')->where('id', 'like', '%' . $request->search . '%')
            ->orWhere('latitude', 'like', '%' . $request->search . '%')
            ->orWhere('longitude', 'like', '%' . $request->search . '%')
            ->orWhereHas('complex', function($query) use($request) {
                $query->where('name', 'like', '%' . $request->search . '%');
            })
            ->orderBy('id', 'desc');

        if($user->hasRole('Administrador')  && !$user->hasRole('SuperAdministrador'))
        {
            $query->where('complex_id', $complex_id);
        }

        $rounds = $query->paginate($request->size);

        foreach ($rounds as $round)
        {
            $round->qr_code = Storage::disk('public')->url('qrcodes/' . $round->qr_code);
        }

        return response()->json($rounds);
    }

    public function generateQrCode(Request $request)
    {
        $qrCodeData = $request->input('qr_code_data');

        $qrCode = QrCode::format('png')->generate($qrCodeData);

        $filename = 'qrcode_' . time() . '.png';

        Storage::disk('public')->put('qrcodes/' . $filename, $qrCode);

        $url = Storage::disk('public')->url('qrcodes/' . $filename);

        return response()->json(['message' => 'QR code saved successfully', 'qr_code_url' => $url]);
    }
}

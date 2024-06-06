<?php

namespace App\Http\Controllers;

use FFMpeg\FFMpeg;
use GuzzleHttp\Client;
use App\Models\Setting;
use Illuminate\Http\Request;
use FFMpeg\Coordinate\TimeCode;
use Illuminate\Support\Facades\Http;
use FFMpeg\Driver\FFMpegDriverListen;
use Illuminate\Support\Facades\Storage;

class ScreenShotController extends Controller
{
    public function get_images(Request $request, $ch, $complex_id) 
    {
        $setting = Setting::where('complex_id', $complex_id)->where('is_active', 1)->first();
        
        if($setting == null)
        {
            return response()->json([
                'status' => false,
                'message' => 'No se encontró la configuración de la cámara',
                'data' => null
            ], 203);
        }

        $url = "http://$setting->direction_ip:$setting->port/cgi-bin/snapshot.cgi?channel=$ch&subtype=0";

        $username = $setting->user;
        $password = $setting->password;

        $response = Http::withDigestAuth($username, $password)->get($url);

        if ($response->successful()) 
        {
            $imageContent = $response->body();

            return response($imageContent)->header('Content-Type', 'image/jpeg');
        } 
        else 
        {
            return response('Error en la solicitud HTTP: ' . $response->status(), 500);
        }
    }
}

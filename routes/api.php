<?php

use App\Events\CameraEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SSEContoller;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\ComplexController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoundController;
use App\Http\Controllers\Api\VisitController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/send-data', [SSEContoller::class, 'send_event'])->name('send-data');

Route::prefix('v1')->group(function () 
{
    Route::prefix('auth')->group(function () 
    {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/login-admin', [AuthController::class, 'auth_config']);
        
        Route::middleware('auth:sanctum')->group(function () 
        {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/check-token', [AuthController::class, 'checkToken']);
        });
    });

    Route::middleware('auth:sanctum')->group(function () 
    {
        Route::prefix('round')->group(function()
        {
            Route::post('/register', [RoundController::class, 'register_round']);
        });

        Route::prefix('visit')->group(function() {
            Route::post('/register', [VisitController::class, 'update_state']);
        });

        Route::post('/fcm_token', [AuthController::class, 'update_fcm_token']);

        Route::get('/complex/select_list', [ComplexController::class, 'select_list'])->name('complex.select_list_demo');
    });

    Route::post('/channel-cameras', function(Request $request) {

        /*
        $android = $request->android;

        $imageData = [];

        if($android)
        {
            $images = $request->img;
            
            foreach ($images as $image) 
            {
                $image_data = base64_decode($image);

                $file_name = uniqid() . '.jpg';

                $url = Storage::disk('public')->put('temp/images/' . $file_name, $image_data);

                $full_url = Storage::disk('public')->url('temp/images/' . $file_name);

                $imageData[] = $full_url;

            }
        }
        else
        {
            $images = $request->file('img');
            
            foreach ($images as $image) 
            {
            
                $url = Storage::disk('public')->put('temp/images', $image);
                
                $full_url = Storage::disk('public')->url($url);

                $imageData[] = $full_url;
            }
            
        }
        */

        $data = [
            'complex_id' => 1,
            'action' => 2,
            'img' => 3,
        ];

        broadcast(new CameraEvent($data))->toOthers();

        return response()->json([
            'status' => true,
            'data' => $data,
            'message' => 'Imagenes enviadas correctamente'
        ]);
    });
});

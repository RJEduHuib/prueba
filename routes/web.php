<?php

use App\Http\Controllers\CompanyController;
use Inertia\Inertia;
use App\Models\Setting;
use App\Events\CameraEvent;
use Illuminate\Http\Request;
use App\Exports\VisitsExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SSEContoller;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HouseController;
use App\Http\Controllers\RoundController;
use App\Http\Controllers\VisitController;
use App\Http\Controllers\ComplexController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\EarlyVisitController;
use App\Http\Controllers\ExternDataController;
use App\Http\Controllers\PanicAlertController;
use App\Http\Controllers\ScreenShotController;
use App\Http\Controllers\SupervisorController;
use App\Http\Controllers\CentralistaController;
use App\Http\Controllers\RoundRegisterController;
use Barryvdh\DomPDF\Facade\Pdf;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return redirect(route('dashboard'));
});

Route::get('/phpinfo', function () {
    return phpinfo();
});

Route::get('/stream', [SSEContoller::class, 'stream'])->name('stream');
Route::get('/send_event', [SSEContoller::class, 'send_event'])->name('send_event');


Route::get('users/emails',[UserController::class, 'select'])->name('user.select');

Route::middleware(['auth'])->group(function () {

    Route::get('cameras/images/{ch}/{complex_id}', [ScreenShotController::class, 'get_images'])->name('cameras.images');

    Route::get('bitacora/file/{file}', [VisitController::class, 'download'])->name('visit.download');

    Route::prefix('modulos')->group(function () {

        Route::get('/cedula-ve/{ce}', [ExternDataController::class, 'person_ve'])->name('cedula_ve');

        Route::get('/export', function(Request $request)
        {
            return Excel::download(new VisitsExport($request->date_start, $request->date_end, $request->complex_id), 'visits.xlsx');
        })->name('export_visits');

        Route::get('/inicio', [HomeController::class, 'index'])->name('dashboard');

        //Route::post('/notification/panic', [AlertNotificationController::class, 'send_notification'])->name('notfication');

        Route::get('/storage-link', function() {
            Artisan::call('storage:link');

            return redirect(route('dashboard'));
        });

        Route::get('/visit/complex/{id}', [ComplexController::class, 'complex_info'])->name('complex.info');

        Route::middleware(['role:Centralista'])->group(function () {

            Route::prefix('centralista')->group(function () {
                Route::get('/', [CentralistaController::class, 'index'])->name('centralista.index');

                Route::get('/list/rounds/{id}', [RoundRegisterController::class, 'list_rounds'])->name('round_register.list_rounds');
                Route::get('/list/alerts/{id}', [PanicAlertController::class, 'list'])->name('panic_alert.list');
                Route::get('/show/{id}', [PanicAlertController::class, 'show'])->name('panic_alert.show');
            });
        });

        Route::middleware(['role:Supervisor'])->group(function () {

            Route::prefix('supervisor')->group(function () {
                Route::get('/', [SupervisorController::class, 'index'])->name('supervisor.index');
                Route::get('/list', [RoundRegisterController::class, 'list'])->name('round_register.list');
                Route::post('/create/{id}', [RoundRegisterController::class, 'create'])->name('round_register.create');

            });
        });

        Route::get('/show/{id}', [RoundRegisterController::class, 'show'])->name('round_register.show');

        Route::middleware(['role:SuperAdministrador'])->group(function()
        {
            Route::prefix('empresas')->group(function()
            {
                Route::get('/', [CompanyController::class, 'index'])->name('company.index');
                Route::get('/list', [CompanyController::class, 'list'])->name('company.list');
                Route::post('/', [CompanyController::class, 'create'])->name('company.create');
                Route::post('/update/{id}', [CompanyController::class, 'update'])->name('company.update');
                Route::get('/company/{id}', [CompanyController::class, 'show'])->name('company.show');
                Route::delete('/{id}', [CompanyController::class, 'destroy'])->name('company.destroy');
                Route::get('/select', [CompanyController::class, 'select'])->name('company.select');
            });
        });


        Route::middleware(['role:Guardia'])->group(function()
        {
            Route::prefix('visitas_anticipadas')->group(function()
            {
                Route::get('/', [EarlyVisitController::class, 'index'])->name('early_visit.index');
                Route::get('/create', [EarlyVisitController::class, 'createView'])->name('early_visit.createView');
                Route::get('edit/{id}', [EarlyVisitController::class, 'editView'])->name('early_visit.editView');
                Route::get('/list', [EarlyVisitController::class, 'list'])->name('early_visit.list');
                Route::post('/', [EarlyVisitController::class, 'create'])->name('early_visit.create');
                Route::post('/update/{id}', [EarlyVisitController::class, 'update'])->name('early_visit.update');
                Route::get('/early_visit/{id}', [EarlyVisitController::class, 'show'])->name('early_visit.show');
                Route::delete('/delete/visit/{id}', [EarlyVisitController::class, 'destroy'])->name('early_visit.destroy');

                Route::get('/early_visit/qr/{id}', [EarlyVisitController::class, 'approve'])->name('early_visit.approve');

            });

            Route::prefix('bitacoras')->group(function()
            {
                Route::get('/', [VisitController::class, 'index'])->name('visit.index');
                Route::get('/create', [VisitController::class, 'createView'])->name('visit.createView');
                Route::get('edit/{id}', [VisitController::class, 'editView'])->name('visit.editView');
                Route::get('/list', [VisitController::class, 'list'])->name('visit.list');
                Route::post('/', [VisitController::class, 'create'])->name('visit.create');
                Route::post('/update/{id}', [VisitController::class, 'update'])->name('visit.update');
                Route::get('/visit/{id}', [VisitController::class, 'show'])->name('visit.show');
                Route::delete('/{id}', [VisitController::class, 'destroy'])->name('visit.destroy');
            });

            Route::get('/house/select', [HouseController::class, 'select'])->name('house.select');

            Route::get('/house/house/{id}', [HouseController::class, 'show'])->name('house.show');

            Route::prefix('extern_data')->group(function()
            {
                Route::get('/vehicle/{plate}', [ExternDataController::class, 'vehicle'])->name('extern_data.vehicle');
                Route::get('/person/{ci}', [ExternDataController::class, 'person'])->name('extern_data.person');
            });

            Route::post('/upload/images', [VisitController::class, 'UploadImages'])->name('visit.uploadImages');
            Route::delete('/delete/images', [VisitController::class, 'DeleteImages'])->name('visit.DeleteImages');
        });


        Route::middleware(['role:Administrador'])->group(function()
        {
            Route::prefix('usuarios')->group(function() {
                Route::get('/', [UserController::class, 'index'])->name('user.index');
                Route::get('/list', [UserController::class, 'list'])->name('user.list');
                Route::post('/', [UserController::class, 'create'])->name('user.create');
                Route::post('/update/{id}', [UserController::class, 'update'])->name('user.update');
                Route::get('/user/{id}', [UserController::class, 'show'])->name('user.show');
                Route::delete('/{id}', [UserController::class, 'destroy'])->name('user.destroy');
            });

            Route::prefix('conjuntos')->group(function() {
                Route::get('/', [ComplexController::class, 'index'])->name('complex.index');
                Route::get('/list', [ComplexController::class, 'list'])->name('complex.list');
                Route::post('/', [ComplexController::class, 'create'])->name('complex.create');
                Route::post('/update/{id}', [ComplexController::class, 'update'])->name('complex.update');
                Route::get('/complex/{id}', [ComplexController::class, 'show'])->name('complex.show');
                Route::delete('/{id}', [ComplexController::class, 'destroy'])->name('complex.destroy');
                Route::get('/select', [ComplexController::class, 'select'])->name('complex.select');
            });

            Route::prefix('casas')->group(function() {
                Route::get('/', [HouseController::class, 'index'])->name('house.index');
                Route::get('/list', [HouseController::class, 'list'])->name('house.list');
                Route::post('/', [HouseController::class, 'create'])->name('house.create');
                Route::post('/update/{id}', [HouseController::class, 'update'])->name('house.update');
                Route::delete('/{id}', [HouseController::class, 'destroy'])->name('house.destroy');

                Route::post('/import/houses', [HouseController::class, 'import'])->name('house.import');
            });

            Route::prefix('dispositivos_vinculados')->group(function() {
                Route::get('/', [SettingController::class, 'index'])->name('setting.index');
                Route::get('/list', [SettingController::class, 'list'])->name('setting.list');
                Route::post('/', [SettingController::class, 'create'])->name('setting.create');
                Route::post('/update/{id}', [SettingController::class, 'update'])->name('setting.update');
                Route::get('/setting/{id}', [SettingController::class, 'show'])->name('setting.show');
                Route::delete('/{id}', [SettingController::class, 'destroy'])->name('setting.destroy');
            });

            Route::prefix('rondas')->group(function() {
                Route::get('/', [RoundController::class, 'index'])->name('round.index');
                Route::get('/list', [RoundController::class, 'list'])->name('round.list');
                Route::post('/', [RoundController::class, 'create'])->name('round.create');
                Route::post('/update/{id}', [RoundController::class, 'update'])->name('round.update');
                Route::get('/round/{id}', [RoundController::class, 'show'])->name('round.show');
                Route::delete('/{id}', [RoundController::class, 'destroy'])->name('round.destroy');
            });


            Route::get('/config-cache', function() {

                Artisan::call('optimize:clear');

                Artisan::call('config:cache');
                Artisan::call('route:cache');
                Artisan::call('view:cache');

                return redirect(route('dashboard'));
            });

            Route::get('/clear-config', function() {

                Artisan::call('optimize:clear');

                Artisan::call('config:clear');
                Artisan::call('route:clear');
                Artisan::call('view:clear');

                return redirect(route('dashboard'));
            });

        });

        Route::get('/users/list_select', [UserController::class, 'select_user'])->name('users.select_user');

        Route::get('/complex/select_list', [ComplexController::class, 'select_list'])->name('complex.select_list');
        Route::get('/perfil', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/perfil', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/perfil', [ProfileController::class, 'destroy'])->name('profile.destroy');

        Route::post('/alert-panic/{id}', [PanicAlertController::class, 'send_event'])->name('alert.panic');


        Route::get('/informacion', function () {
            return Inertia::render('About/Index');
        })->name('about');

        Route::post('/channel-cameras', function(Request $request){
            $settings = Setting::where('complex_id', $request->complex_id)->get();

            $data = [
                'complex_id' => $request->complex_id,
                'comms' => $settings[0],
                'action' => $request->action,
            ];

            broadcast(new CameraEvent($data))->toOthers();

            return response()->json(['message' => 'Evento enviado correctamente', 'status' => true]);
        })->name('channel-cameras');

        Route::post('/send-mail/69bb3a74-2f4c-44be-b6f1-37d4db66835c', function(Request $request)
        {
            $file = $request->file('file');

            $emails = 'amdin@xbox.com, trest.amiksd@test.com';
            $recipientEmails = explode(',', $emails);

            Mail::send([], [], function($message) use ($recipientEmails, $file) {
                $message->to($recipientEmails)
                    ->subject('Reporte de Visitas - Bitaldata')
                    ->attach($file->getRealPath(), [
                        'as' => $file->getClientOriginalName(),
                        'mime' => $file->getMimeType(),
                    ]);
            });
        });
    });
});

Route::get('/pdf', function() {

    $data = [
        'title' => 'Bitaldata - Reporte de Visita',
    ];

    $pdf = Pdf::loadView('pdfs.index', $data);


    return $pdf->stream('report.pdf');
});

require __DIR__.'/auth.php';


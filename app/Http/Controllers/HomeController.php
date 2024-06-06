<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Visit;
use Inertia\Response;
use App\Models\Complex;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function index() : Response
    {
        $users = User::count();
        $complex = Complex::count();
        $visits = Visit::count();

        $info = [
            'users' => $users,
            'complex' => $complex,
            'visits' => $visits,
        ];  

        $date_actual = date('Y-m-d');

        $startOfWeek = date('Y-m-d', strtotime('last monday'));
        $endOfWeek = date('Y-m-d', strtotime('next sunday'));

        $dayNamesInSpanish = [
            'Sunday' => 'Domingo',
            'Monday' => 'Lunes',
            'Tuesday' => 'Martes',
            'Wednesday' => 'Miércoles',
            'Thursday' => 'Jueves',
            'Friday' => 'Viernes',
            'Saturday' => 'Sábado',
        ];

        $visits = DB::table('visits')
            ->selectRaw('count(*) as count, DATE_FORMAT(visit_date, "%Y-%m-%d") as date')
            ->whereBetween('visit_date', [$startOfWeek, $endOfWeek])
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->map(function ($item) use ($dayNamesInSpanish) {
                $dayInSpanish = $dayNamesInSpanish[date('l', strtotime($item->date))];
                return [
                    'count' => $item->count,
                    'date' => $dayInSpanish,
                ];
            });

        $earlyVisits = DB::table('early_visits')
            ->selectRaw('count(*) as count, DATE_FORMAT(visit_date, "%Y-%m-%d") as date')
            ->whereBetween('visit_date', [$startOfWeek, $endOfWeek])
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->map(function ($item) use ($dayNamesInSpanish) {
                $dayInSpanish = $dayNamesInSpanish[date('l', strtotime($item->date))];
                return [
                    'count' => $item->count,
                    'date' => $dayInSpanish,
                ];
            });


        $weekData = [
            'startOfWeek' => $startOfWeek,
            'endOfWeek' => $endOfWeek,
        ];

        return Inertia::render('Home/Index', [
            'info' => $info,
            'visits' => $visits,
            'early_visits' => $earlyVisits,
            'week_data' => $weekData,
        ]);
    }
}

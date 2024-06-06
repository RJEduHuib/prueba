<?php

namespace App\Exports;

use Carbon\Carbon;
use App\Models\Visit;
use App\Models\Complex;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Illuminate\Contracts\Support\Responsable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class VisitsExport implements FromCollection, WithHeadings, ShouldAutoSize
{
    protected $startDate;
    protected $endDate;
    protected $complexId;
    
    public function __construct($startDate, $endDate, $complexId)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->complexId = $complexId;
    }

    public function collection()
    {
        $startDate = Carbon::createFromFormat('Y-m-d', $this->startDate)->startOfDay();
        $endDate = Carbon::createFromFormat('Y-m-d', $this->endDate)->endOfDay();

        $complex = Complex::find($this->complexId);

        $visits = Visit::whereBetween('visit_date', [$startDate, $endDate])
            ->whereHas('house', function ($query) {
                $query->where('complex_id', $this->complexId);
            })
            ->get()
            ->groupBy('visit_date')
            ->map(function ($group, $key) use ($complex) {
                return [
                    'Fecha' => $group->first()->visit_date,
                    'Numero Total de Visitas' => $group->count(),
                    'Nombre del Conjunto' =>  $complex->name,
                ];
            });

        return $visits->values(); 
    }

    public function headings(): array
    {
        return [
            'Fecha',
            'Total de Visitas',
            'Nombre de Conjunto'
        ];
    }
}

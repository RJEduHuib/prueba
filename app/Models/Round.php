<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Round extends Model
{
    use HasFactory;

    protected $fillable = [
        'latitude',
        'longitude',
        'qr_code',
        'complex_id',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $appends = [
        'qr_fecha'
    ];

    public function complex()
    {
        return $this->belongsTo(Complex::class);
    }

    public function getQrFechaAttribute()
    {
        $date_format = date('Y-m-d', strtotime($this->created_at));

        
        $date_carbon = Carbon::createFromFormat('Y-m-d', $date_format);

        $day_name = ucfirst($date_carbon->translatedFormat('l'));
        $month_name = ucfirst($date_carbon->translatedFormat('F'));
        $year = $date_carbon->year;

        $full_date = "$day_name, {$date_carbon->day} de $month_name de $year";
        
        return $full_date;
    }
}

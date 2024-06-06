<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PanicAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'complex_id',
        'user_id',
        'time_alerted',
        'date_alerted',
    ];

    protected $appends = [
        'time_alerted_formatted',
        'date_alerted_formatted'
    ];

    public function complex()
    {
        return $this->belongsTo(Complex::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getTimeAlertedFormattedAttribute()
    {
        $time = substr($this->time_alerted, 0, -3);

        return $time;
    }

    public function getDateAlertedFormattedAttribute()
    {
        $date_carbon = Carbon::createFromFormat('Y-m-d', $this->date_alerted);

        $day_name = ucfirst($date_carbon->translatedFormat('l'));
        $month_name = ucfirst($date_carbon->translatedFormat('F'));
        $year = $date_carbon->year;

        $full_date = "$day_name, {$date_carbon->day} de $month_name de $year";

        return $full_date;
    }
}

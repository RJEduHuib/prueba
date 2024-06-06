<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RoundRegister extends Model
{
    use HasFactory;

    protected $fillable = [
        'round_id',
        'user_id',
        'time_registered',
        'date_registered',
        'description',
    ];

    protected $appends = [
        'date_registered_formatted',
        'time_registered_formatted'
    ];

    public function round()
    {
        return $this->belongsTo(Round::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

     public function getDateRegisteredFormattedAttribute()
    {
        $date_carbon = Carbon::createFromFormat('Y-m-d', $this->date_registered);

        $day_name = ucfirst($date_carbon->translatedFormat('l'));
        $month_name = ucfirst($date_carbon->translatedFormat('F'));
        $year = $date_carbon->year;

        $full_date = "$day_name, {$date_carbon->day} de $month_name de $year";

        return $full_date;
    }

    public function getTimeRegisteredFormattedAttribute()
    {
        $time = substr($this->time_registered, 0, -3);

        return $time;
    }
}

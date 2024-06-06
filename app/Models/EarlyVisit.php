<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EarlyVisit extends Model
{
    use HasFactory;

    protected $fillable = [
        'house_id',
        'user_id',
        'visit_date',
        'visit_time',
        'description',
        'vehicle_plate',
        'visitor_ci',
        'number_visitors',
        'type_visit',
        'pending',
        'qr_code',
        'approve_time',
        'approved_by'
    ];

    protected $appends = [
        'visit_date_formatted',
        'visit_time_formatted'
    ];

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
   
    public function getVisitDateFormattedAttribute()
    {
        $date_carbon = Carbon::createFromFormat('Y-m-d', $this->visit_date);

        $day_name = ucfirst($date_carbon->translatedFormat('l'));
        $month_name = ucfirst($date_carbon->translatedFormat('F'));
        $year = $date_carbon->year;

        $full_date = "$day_name, {$date_carbon->day} de $month_name de $year";

        return $full_date;
      
    }
    
    public function getVisitTimeFormattedAttribute()
    {
        $time = substr($this->visit_time, 0, -3);

        return $time;
    }
    
}

<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

class Visit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'visit_date',
        'visit_time',
        'description',
        'visit_images',
        'original_visit_images',
        'vehicle_plate',
        'visitor_id',
        'number_visitors',
        'type_visit',
        'house_id',
        'file_id'
    ];

    protected $appends = [
        'visit_date_formatted',
        'visit_time_formatted',
        'file_url'
    ];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function house(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(House::class);
    }

    public function getVisitDateFormattedAttribute(): string
    {
        $date_carbon = Carbon::createFromFormat('Y-m-d', $this->visit_date);

        $day_name = ucfirst($date_carbon->translatedFormat('l'));
        $month_name = ucfirst($date_carbon->translatedFormat('F'));
        $year = $date_carbon->year;

        $full_date = "$day_name, {$date_carbon->day} de $month_name de $year";

        return $full_date;

    }

    public function getVisitTimeFormattedAttribute(): string
    {
        $time = substr($this->visit_time, 0, -3);

        return $time;
    }

    public function getFileUrlAttribute(): string
    {
        if ($this->file_id)
        {
            return Storage::disk('r2')->url("visits/{$this->file_id}.pdf");
        }
        else
        {
            return '';
        }
    }
}

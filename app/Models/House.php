<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class House extends Model
{
    use HasFactory;

    protected $fillable = [
        'complex_id',
        'number_house',
        'owner_name',
        'owner_surname',
        'owner_email',
        'owner_phone',
        'owner_phone_2',
        'plates',
        'active',
    ];

    public function complex(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Complex::class);
    }

    public function getOwnerNameAttribute($value): string
    {
        return strtoupper($value);
    }

    public function getOwnerSurnameAttribute($value): string
    {
        return strtoupper($value);
    }

    public function getOwnerEmailAttribute($value)
    {
        return strtolower($value);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'logo',
    ];

    protected $appends = ['logo_url'];

    public function getLogoUrlAttribute(): string
    {
        return asset('storage/' . $this->logo);
    }

    public function complexes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Complex::class);
    }
}

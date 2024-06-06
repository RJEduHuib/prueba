<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\HigherOrderCollectionProxy;

/**
 * @property HigherOrderCollectionProxy|mixed|null $settings
 * @property HigherOrderCollectionProxy|mixed|null $company
 */

class Complex extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'city',
        'is_cameras',
        'is_whatsapp',
        'is_outomatisering',
        'admin_email',
        'company_id',
        'user_id',
    ];

    public function houses(): HasMany
    {
        return $this->hasMany(House::class);
    }

    protected $casts = [
        'is_cameras' => 'boolean',
        'is_emails' => 'boolean',
        'is_outomatisering' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function settings(): HasOne
    {
        return $this->hasOne(Setting::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getNameAttribute($value): string
    {
        return $this->attributes['name'] = strtoupper($value);
    }

    public function getCityAttribute($value): string
    {
        return $this->attributes['city'] = strtoupper($value);
    }
}

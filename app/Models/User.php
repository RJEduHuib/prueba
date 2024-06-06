<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'surname',
        'ci',
        'phone',
        'address',
        'city',
        'email',
        'password',
        'active'
    ];

    protected $appends = [
        'profile_photo_url',
        'roles_names'
    ];

    protected $hidden = [
        'password',
        'remember_token'
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'active' => 'boolean'
    ];

    public function getProfilePhotoUrlAttribute(): ?string
    {
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . "+" .urlencode($this->surname) .'&color=FFFFFF&background=000000';
    }

    public function getNameAttribute($value): string
    {
        return $this->attributes['name'] = strtoupper($value);
    }

    public function getSurnameAttribute($value): string
    {
        return $this->attributes['surname'] = strtoupper($value);
    }

    public function getEmailAttribute($value): string
    {
        return $this->attributes['email'] = strtolower($value);
    }

    public function getRolesNamesAttribute(): \Illuminate\Support\Collection
    {
        return $this->getRoleNames();
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function roundRegisters(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RoundRegister::class);
    }

    public function getCityAttribute($value): string
    {
        return $this->attributes['city'] = strtoupper($value);
    }

    public function complex(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Complex::class);
    }
}

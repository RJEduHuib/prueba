<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SSEEvents extends Model
{
    use HasFactory;

    protected $fillable = [
        'event',
        'type',
        'message',
        'images',
        'is_delivered',
    ];
}

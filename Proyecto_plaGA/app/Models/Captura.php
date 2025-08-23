<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Captura extends Model
{
    protected $fillable = [
        'plaga_detectada',
        'confianza',
        'solucion',
        'fecha_captura',
    ];

    public $timestamps = true;
}

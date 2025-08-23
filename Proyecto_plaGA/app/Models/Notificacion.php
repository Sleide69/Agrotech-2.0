<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    // ¡Añade esta línea!
    // Le decimos a Laravel que la tabla para este modelo se llama 'notificaciones'.
    protected $table = 'notificaciones';

    protected $fillable = ['user_id', 'mensaje', 'leido'];

    protected $casts = [
        'leido' => 'boolean',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
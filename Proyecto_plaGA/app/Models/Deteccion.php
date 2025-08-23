<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Deteccion extends Model
{
    protected $fillable = ['user_id', 'plaga', 'ubicacion', 'hora_detectada'];

    // Si tienes relación con User, puedes agregarla aquí
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

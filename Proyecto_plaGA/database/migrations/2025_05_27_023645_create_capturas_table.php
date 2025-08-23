<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('capturas', function (Blueprint $table) {
            $table->id();
            $table->string('plaga_detectada');
            $table->float('confianza');
            $table->string('solucion');
            $table->timestamp('fecha_captura');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('capturas');
    }
};

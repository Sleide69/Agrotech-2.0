<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware; // <-- ¡Añade esta línea!
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RegistroUsuarioTest extends TestCase
{
    use RefreshDatabase;
    use WithoutMiddleware; // <-- ¡Añade esta línea aquí!

    public function test_registro_de_usuario_funciona()
    {
        // Ya no es necesario deshabilitar el middleware CSRF aquí
        // porque `WithoutMiddleware` lo hace para toda la clase.
        // $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);

        $response = $this->post('/register', [
            'name' => 'Usuario XP',
            'cedula' => '1234567890',
            'email' => 'usuarioxp@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        // Verifica que la respuesta tenga un código de estado 302 (redirección)
        $response->assertStatus(302);

        // Verifica que la respuesta sea una redirección a la ruta /login
        $response->assertRedirect(route('login'));

        // Verifica que el usuario fue creado en la base de datos
        $this->assertDatabaseHas('users', [
            'email' => 'usuarioxp@example.com',
            'cedula' => '1234567890', // Asegúrate de incluir la cédula si es un campo de la tabla users
        ]);

        // Verifica que la contraseña fue hasheada correctamente
        $user = User::where('email', 'usuarioxp@example.com')->first();
        $this->assertNotNull($user, 'El usuario no fue encontrado en la base de datos después del registro.');
        $this->assertTrue(Hash::check('Password123', $user->password), 'La contraseña no fue hasheada correctamente.');
    }
}
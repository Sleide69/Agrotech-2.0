<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Registro</title>
    @vite(['resources/css/auth.css'])
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Crear Cuenta</h1>
            <form id="registerForm">
                <input type="text" id="name" placeholder="Nombre completo" required>
                <input type="email" id="email" placeholder="Correo electrónico" required>
                <input type="number" id="cedula" placeholder="Cédula" required>
                <input type="password" id="password" placeholder="Contraseña" required>
                <input type="password" id="password_confirmation" placeholder="Confirmar contraseña" required>
                <button class="boton" type="submit">Registrarse</button>
                <div id="errorMsg" class="error" style="color:red;margin-top:10px;"></div>
            </form>
            <a href="{{ route('login') }}">¿Ya tienes cuenta? Inicia sesión</a>
        </div>
    </div>
    <script>
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const cedula = document.getElementById('cedula').value;
        const password = document.getElementById('password').value;
        const password_confirmation = document.getElementById('password_confirmation').value;
        const errorDiv = document.getElementById('errorMsg');
        errorDiv.textContent = '';

        try {
            const response = await fetch('{{ url('/api/register') }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ name, email, cedula, password, password_confirmation })
            });
            const data = await response.json();
            if (response.ok && data.token) {
                localStorage.setItem('jwt_token', data.token);
                window.location.href = "{{ route('captura.form') }}";
            } else {
                errorDiv.textContent = data.message || 'Error en el registro';
            }
        } catch (err) {
            errorDiv.textContent = 'No se pudo conectar al servidor.';
        }
    });
    </script>
</body>
</html>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Iniciar Sesión</title>
    @vite(['resources/css/auth.css'])
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Iniciar Sesión</h1>
            <form id="loginForm">
                <input type="email" id="email" placeholder="Correo electrónico" required>
                <input type="password" id="password" placeholder="Contraseña" required>
                <button class="boton" type="submit">Entrar</button>
                <div id="errorMsg" class="error" style="color:red;margin-top:10px;"></div>
            </form>
            <a href="{{ route('register.form') }}">¿No tienes cuenta? Regístrate</a>
        </div>
    </div>
    <script>
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('errorMsg');
        errorDiv.textContent = '';

        try {
            const response = await fetch('{{ url('/api/login') }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok && data.token) {
                localStorage.setItem('jwt_token', data.token);
                window.location.href = "{{ route('captura.imagen') }}";
            } else {
                errorDiv.textContent = data.message || 'Error de login';
            }
        } catch (err) {
            errorDiv.textContent = 'No se pudo conectar al servidor.';
        }
    });
    </script>
</body>
</html> 
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mundo verde - Inicio</title>
    @vite(['resources/css/welcome.css'])
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Bienvenido a Mundo Verde</h1>
            <p>Monitoreo Inteligente de Plagas para Agricultura Sostenible</p>
            <a href="{{ route('login') }}" class="boton">Iniciar Monitoreo</a>
        </div>
    </div>
</body>
</html>


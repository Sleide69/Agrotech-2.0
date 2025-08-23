<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Resultado de Detección</title>
    @vite(['resources/css/captura.css'])
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 30px;
            background-color: #f4f4f4;
        }
        .resultado {
            font-weight: bold;
            padding: 15px;
            margin: 20px auto;
            border-radius: 10px;
            max-width: 500px;
        }
        .exito { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .fallo { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .expirado { background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; }
        img {
            max-width: 100%;
            height: auto;
            border: 2px solid #333;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        ul { list-style: none; padding: 0; }
        li {
            background-color: #fff;
            border: 1px solid #ccc;
            margin: 8px auto;
            padding: 10px;
            border-radius: 8px;
            max-width: 500px;
            text-align: left;
        }
        button, a {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 15px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            border: none;
            cursor: pointer;
        }
        button:hover, a:hover { background-color: #0056b3; }
        h2 { margin-top: 30px; }
        .notificaciones {
            background: #e0f7fa;
            border: 1px solid #b2ebf2;
            padding: 20px;
            border-radius: 10px;
            margin: 30px auto 0 auto;
            max-width: 600px;
            text-align: left;
        }
        .notificaciones ul { padding-left: 20px; }
    </style>
</head>
<body>
    <h1>📊 Resultado de la Detección</h1>
    {{-- Si el backend detecta expiración de sesión, muestra mensaje pero NO redirige --}}
    @if(session('jwt_expirado'))
        <div class="resultado expirado">
            ⚠️ Tu sesión ha expirado.<br>
            Puedes seguir viendo el resultado.<br>
            <a href="{{ route('login') }}">Iniciar sesión nuevamente</a>
        </div>
    @endif

    @if(isset($imagenProcesada))
        <div>
            <img src="{{ asset($imagenProcesada) }}" alt="Resultado de detección">
        </div>
    @else
        <p style="color: red;">⚠️ No se pudo cargar la imagen procesada.</p>
    @endif

    @if(!empty($detecciones) && is_array($detecciones) && count($detecciones) > 0)
        <div class="resultado exito">
            🐞 Se detectaron {{ count($detecciones) }} plaga(s) en la imagen.
        </div>
        <h2>🔎 Plagas detectadas:</h2>
        <ul>
            @foreach($detecciones as $item)
                <li>
                    <strong>🦠 Clase:</strong> {{ $item['name'] ?? 'N/A' }}<br>
                    <strong>📈 Confianza:</strong>
                    {{ isset($item['confidence']) ? round($item['confidence'] * 100, 2) . '%' : 'N/A' }}
                </li>
            @endforeach
        </ul>
    @else
        <div class="resultado fallo">
            ✅ No se detectaron plagas en esta imagen.
        </div>
    @endif

    <<div class="notificaciones">
        <h2>🔔 Notificaciones:</h2>
        @if(!empty($notificaciones) && count($notificaciones) > 0)
            <ul>
                @foreach($notificaciones as $notificacion)
                    <li>
                        📌 {{ $notificacion->mensaje ?? (is_array($notificacion) ? $notificacion['mensaje'] : 'Sin mensaje') }}
                    </li>
                @endforeach
            </ul>
        @else
            <p>No tienes notificaciones recientes.</p>
        @endif
    </div>

    <form action="{{ route('captura') }}" method="GET" style="display:inline;">
        <button type="submit">📸 Capturar otra imagen</button>
    </form>
</body>
</html>
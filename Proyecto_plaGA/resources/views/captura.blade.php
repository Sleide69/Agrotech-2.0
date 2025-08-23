<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Captura de Imagen - Monitoreo</title>
    @vite(['resources/css/captura.css'])
</head>
<body>
    <div class="contenedor">
        <div class="formulario">
            <h1>📷 Captura de Imagen</h1>
            <p>Usa tu cámara para registrar el estado de las plantas</p>

            <div class="camara" id="mi_camera"></div>

            <div id="resultado" style="margin-top: 20px; font-family: monospace;"></div>
            <!-- Muestra previa de la imagen capturada -->
            <img id="preview" style="max-width:300px; margin-top:10px; display:none;">          
            <form id="form-guardar" action="{{ route('captura.imagen') }}" method="POST" onsubmit="return false;">
                @csrf
                <input type="hidden" name="imagen" id="imagen">
                <button type="button" id="btn-capturar" onclick="capturar()">📸 Capturar, Analizar y Guardar</button>
            </form>
        </div>
    </div>
    <div id="notificaciones" style="margin-top: 20px; border: 1px solid #ccc; padding: 10px;">
        <h3>🔔 Notificaciones:</h3>
        <ul id="lista-notificaciones"></ul>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/webcamjs/1.0.26/webcam.min.js"></script>
    <script>
    Webcam.set({
        width: 400,
        height: 300,
        image_format: 'jpeg',
        jpeg_quality: 90
    });
    Webcam.attach('#mi_camera');

    // Decodificar JWT y revisar expiración
    function decodeJwt(token) {
        if (!token) return null;
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch (e) {
            return null;
        }
    }

    // Obtener el token JWT desde localStorage y verificar expiración
    function getJwtToken() {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            console.warn("Token JWT no encontrado en localStorage. El usuario debe iniciar sesión.");
            document.getElementById('resultado').textContent = "⚠️ Debes iniciar sesión.";
            return null;
        }
        const decoded = decodeJwt(token);
        if (!decoded || !decoded.exp) {
            console.warn("Token JWT malformado.");
            document.getElementById('resultado').textContent = "⚠️ Token inválido. Por favor inicia sesión de nuevo.";
            return null;
        }
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp < now) {
            document.getElementById('resultado').textContent = "⚠️ Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
            localStorage.removeItem('jwt_token');
            return null;
        }
        return token;
    }

    function cargarNotificaciones() {
        const jwtToken = getJwtToken();
        const ul = document.getElementById("lista-notificaciones");
        if (!jwtToken) {
            ul.innerHTML = '<li>⚠️ Necesitas iniciar sesión para ver notificaciones.</li>';
            return;
        }
        fetch("http://127.0.0.1:8000/api/notificaciones", {
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Accept": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            ul.innerHTML = '';
            if (!data.notificaciones || !Array.isArray(data.notificaciones)) {
                ul.innerHTML = "<li>⚠️ Error: Formato de datos inesperado.</li>";
                return;
            }
            if (data.notificaciones.length === 0) {
                ul.innerHTML = "<li>🕓 No hay notificaciones aún.</li>";
            } else {
                // Mostrar las 5 más recientes (ya vienen ordenadas), más reciente arriba
                data.notificaciones.slice(0, 10).forEach(noti => {
                    const li = document.createElement('li');
                    li.textContent = "📌 " + (noti.mensaje || 'Mensaje no disponible');
                    ul.appendChild(li);
                });
            }
        })
        .catch(error => {
            ul.innerHTML = `<li>❌ Error: ${error.message}</li>`;
        });
    }


    document.addEventListener("DOMContentLoaded", () => {
        cargarNotificaciones();
        setInterval(cargarNotificaciones, 5000);
    });

    function capturar() {
        const btnCapturar = document.getElementById('btn-capturar');
        btnCapturar.disabled = true;
        btnCapturar.textContent = "⏳ Procesando...";

        Webcam.snap(function(data_uri) {
            document.getElementById('imagen').value = data_uri;
            // Mostrar la imagen capturada
            const preview = document.getElementById('preview');
            preview.src = data_uri;
            preview.style.display = 'block';

            // Aquí envía la imagen capturada a tu API Laravel con JWT
            const jwtToken = getJwtToken();
            if (!jwtToken) {
                document.getElementById('resultado').textContent = '❌ Error: No se pudo enviar la imagen (token ausente o expirado).';
                btnCapturar.disabled = false;
                btnCapturar.textContent = "📸 Capturar y Analizar";
                return;
            }

            fetch("{{ url('/api/captura') }}", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ imagen: data_uri })
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        document.getElementById('resultado').textContent = "⚠️ Tu sesión ha expirado o es inválida. Vuelve a iniciar sesión.";
                        btnCapturar.disabled = false;
                        btnCapturar.textContent = "📸 Capturar y Analizar";
                        return Promise.reject(new Error("No autorizado. Inicia sesión."));
                    }
                    return response.json().then(errorData => {
                        throw new Error(`Error al enviar imagen: ${response.status} - ${errorData.error || response.statusText}`);
                    }).catch(() => {
                        throw new Error(`Error al enviar imagen: ${response.status} - ${response.statusText}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                const resultadoDiv = document.getElementById('resultado');
                if (data && Array.isArray(data.detecciones) && data.detecciones.length > 0) {
                    const mensaje = data.detecciones.map(d => `${d.name} (${(d.confidence * 100).toFixed(2)}%)`).join(', ');
                    resultadoDiv.textContent = "✅ Detección: " + mensaje;
                    cargarNotificaciones();
                } else if (data && data.error) {
                    resultadoDiv.textContent = '❌ Error: ' + data.error;
                } else {
                    resultadoDiv.textContent = '✅ No se detectaron plagas en esta imagen.';
                }
            })
            .catch(error => {
                document.getElementById('resultado').textContent =
                    '❌ Error al procesar la imagen: ' + (error.message || 'Error desconocido.');
            })
            .finally(() => {
                btnCapturar.disabled = false;
                btnCapturar.textContent = "📸 Capturar y Analizar";
            });
        });
    }

    </script>

    <form id="logoutForm" action="{{ route('logout') }}" method="POST" onsubmit="return false;">
        @csrf
        <button type="submit">Cerrar sesión</button>
    </form>
    <script>
    document.getElementById('logoutForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            window.location.href = "{{ route('login') }}";
            return;
        }
        const response = await fetch("{{ route('logout') }}", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
                "Accept": "application/json"
            }
        });
        // Limpia el token local y redirige
        localStorage.removeItem('jwt_token');
        window.location.href = "{{ route('login') }}";
    });
    </script>
    
</body>
</html>
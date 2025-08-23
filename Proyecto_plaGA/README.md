# 🌿 Proyecto PlaGA: Sistema de Monitoreo y Detección de Plagas

Proyecto PlaGA es un sistema integral diseñado para el monitoreo y la detección temprana de plagas en plantas utilizando inteligencia artificial. Combina una robusta aplicación web (Laravel) con un backend de procesamiento de imágenes (Flask) para ofrecer una solución en tiempo real. Los usuarios pueden capturar imágenes de plantas, analizarlas con un modelo YOLOv8 entrenado para identificar plagas, y recibir notificaciones instantáneas sobre las detecciones.

## 📦 Características Principales

- **Captura de Imágenes en Tiempo Real**: Permite la captura de imágenes desde una cámara web directamente desde la interfaz de usuario.
- **Detección Inteligente de Plagas**: Utiliza un modelo YOLOv8 personalizado para identificar y clasificar plagas en las imágenes capturadas.
- **Autenticación Laravel Estándar**: Sistema de login/registro sin JWT, usando autenticación nativa de Laravel.
- **Notificaciones en Tiempo Real**: Genera y gestiona notificaciones sobre las plagas detectadas.
- **Almacenamiento Persistente**: Guarda las imágenes y resultados de detección en PostgreSQL.
- **API RESTful**: Endpoints para comunicación entre frontend y backend de IA.
- **Contenedorización Docker**: Configuración completa para desarrollo y despliegue.
- **Interfaz Responsive**: Vista optimizada para mostrar resultados sin redireccionar.

## 🛠️ Tecnologías y Dependencias

### Backend (Laravel - PHP)
- **Laravel 10.x**: Framework PHP para lógica de negocio y API REST
- **PostgreSQL**: Base de datos relacional principal
- **GuzzleHttp**: Cliente HTTP para comunicación con Flask
- **Laravel Vite**: Build tool para assets frontend
- **Blade Templates**: Motor de plantillas

### Backend (Flask - Python para IA)
- **Flask**: Micro-framework para el servidor de IA
- **Flask-CORS**: Manejo de CORS para requests cross-origin
- **PyTorch**: Framework de deep learning
- **Ultralytics YOLOv8**: Modelo de detección de objetos actualizado
- **Pillow (PIL)**: Procesamiento de imágenes
- **OpenCV** (opcional): Procesamiento avanzado de imágenes

### Frontend
- **Blade**: Motor de plantillas de Laravel
- **JavaScript Vanilla**: Sin frameworks adicionales
- **Webcam.js**: Librería para captura de cámara web
- **CSS3**: Estilos responsive

### Infraestructura
- **PostgreSQL 16**: Base de datos en contenedor
- **Nginx** (opcional): Proxy reverso para producción

## 💻 Requerimientos del Sistema

### Software Mínimo:
- **Docker**: 20.x o superior + Docker Compose 2.x
- **Git**: Para clonar el repositorio
- **Navegador moderno**: Chrome, Firefox, Safari, Edge

### Para Desarrollo Local (opcional):
- **PHP**: 8.1 o superior
- **Composer**: Última versión estable
- **Node.js**: 16.x o superior (con npm)
- **Python**: 3.8 o superior
- **PostgreSQL**: 12 o superior

### Hardware Recomendado:
- **CPU**: Procesador moderno (4+ cores)
- **RAM**: 8 GB o más (4 GB mínimo)
- **Almacenamiento**: 10 GB libres
- **Cámara**: Webcam USB o integrada
- **GPU** (opcional): Compatible con CUDA para acelerar YOLOv8

## 📋 Instalación y Configuración

### Opción 1: Docker (Recomendado) 🐳

```bash
# 1. Clonar el repositorio
git clone https://github.com/Sleide69/Proyecto_plaGA.git
cd Proyecto_plaGA

# 2. Copiar configuración de entorno
cp .env.example .env


**Servicios disponibles:**
- Laravel: http://localhost:8000
- Flask IA: http://localhost:5000
- PostgreSQL: localhost:5432

### Opción 2: Instalación Manual 🔧

#### Backend Laravel
```bash
# 1. Instalar dependencias
composer install
npm install

# 2. Configurar entorno
cp .env.example .env
php artisan key:generate

# 3. Configurar base de datos en .env
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=
# DB_USERNAME=
# DB_PASSWORD=

# 4. Ejecutar migraciones
php artisan migrate

# 5. Crear enlace de storage
php artisan storage:link

# 6. Compilar assets
npm run dev
```

#### Backend Flask (IA)
```bash
# 1. Navegar a la carpeta del modelo
cd scripts/my_model

# 2. Crear entorno virtual
python -m venv venv

# 3. Activar entorno virtual
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 4. Instalar dependencias
pip install flask flask-cors torch ultralytics pillow

# 5. Verificar que el modelo best.pt existe en train/weights/
```

#### Ejecutar servidores (Manual)
```bash
# Terminal 1: Laravel
php artisan serve

# Terminal 2: Flask
cd scripts/my_model
.\venv\Scripts\activate  # Windows
python servidor_flask.py
```

## 🚀 Uso de la Aplicación

1. **Acceder**: http://localhost:8000
2. **Registrarse/Iniciar sesión**: Usar el sistema de autenticación Laravel
3. **Ir a captura**: Navegar a la sección de captura de imágenes
4. **Permitir cámara**: Autorizar acceso a la webcam
5. **Capturar imagen**: Hacer clic en "📸 Capturar y Analizar"
6. **Ver resultados**: Los resultados aparecen en la misma página sin redirección

## 📁 Estructura del Proyecto

```
Proyecto_plaGA/
│
├── 🐳 Docker
│   ├── docker-compose.yml          # Orquestación de servicios
│   ├── dockerfile                  # Contenedor Laravel
│   └── docker-entrypoint.sh        # Script de inicialización
│
├── 🎨 Frontend & Backend Laravel
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php   # Autenticación sin JWT
│   │   │   ├── CapturaController.php # Manejo de imágenes
│   │   │   └── PlagaController.php   # Lógica de plagas
│   │   └── Models/
│   │       ├── User.php             # Sin HasApiTokens
│   │       ├── Captura.php          # Registro de capturas
│   │       └── Notificacion.php     # Sistema de notificaciones
│   │
│   ├── config/
│   │   └── app.php                  # Sin JWT providers
│   │
│   ├── resources/views/
│   │   ├── auth/
│   │   │   ├── login.blade.php      # Login estándar
│   │   │   └── register.blade.php   # Registro
│   │   ├── plagas/
│   │   │   └── captura-imagen.blade.php # Resultado de detección
│   │   └── captura.blade.php        # Captura de cámara
│   │
│   └── routes/
│       ├── web.php                  # Rutas web sin middleware JWT
│       └── api.php                  # API endpoints (/api/captura)
│
├── 🤖 Backend IA (Flask)
│   └── scripts/
│       ├── dockerfile               # Contenedor Flask
│       └── my_model/
│           ├── servidor_flask.py    # Servidor IA actualizado
│           ├── venv/                # Entorno virtual Python
│           └── train/weights/
│               └── best.pt          # Modelo YOLOv8
│
├── 💾 Database & Storage
│   ├── database/migrations/         # Migraciones sin JWT
│   └── storage/app/public/capturas/ # Imágenes guardadas
│
├── ⚙️ Configuración
│   ├── .env                         # Variables de entorno
│   ├── .env.example                 # Template de configuración
│   ├── composer.json                # Sin tymon/jwt-auth
│   └── package.json                 # Dependencies frontend
│
└── 📚 Documentación
    └── README.md                    # Este archivo
```

## 📡 API Endpoints

### 🔍 Detección de Plagas (Flask)
```http
POST http://127.0.0.1:5000/detect
Content-Type: multipart/form-data

Body: image (file)
```

**Respuesta actualizada:**
```json
{
  "detecciones": [
    {
      "name": "pulgon",
      "confidence": 0.85
    },
    {
      "name": "mosca_blanca", 
      "confidence": 0.72
    }
  ]
}
```

### 📸 Captura de Imagen (Laravel)
```http
POST /api/captura
Content-Type: application/json

{
  "imagen": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Respuesta:**
```json
{
  "success": true,
  "detecciones": [...],
  "imagen_guardada": "storage/capturas/imagen_123.jpg",
  "mensaje": "Imagen procesada correctamente"
}
```

### 🔔 Notificaciones (Laravel)
```http
GET /api/notificaciones
Authorization: Session-based (Laravel Auth)
```


## 🔧 Troubleshooting

### Problemas Comunes

**❌ Error 404 en `/api/captura`**
```bash
# Verificar que la ruta existe
cat routes/api.php | grep captura

# Limpiar cache de rutas
php artisan route:clear
```

**❌ Modelo YOLOv8 no carga**
```bash
# Verificar ruta en servidor_flask.py
ls -la scripts/my_model/train/weights/best.pt

# Probar carga manual
python -c "from ultralytics import YOLO; YOLO('path/to/best.pt')"
```

**❌ Imágenes no se muestran**
```bash
# Recrear enlace de storage
php artisan storage:link --force

# Verificar permisos
chmod -R 755 storage/
chmod -R 755 public/storage/
```

**❌ Docker exec format error**
```bash
# Convertir docker-entrypoint.sh a formato Unix
dos2unix docker-entrypoint.sh
# O en VS Code: cambiar CRLF a LF
```

**❌ Flask no conecta**
```bash
# Verificar que Flask está corriendo
curl http://127.0.0.1:5000/



### Logs Importantes

```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Flask logs (si ejecutas manual)
cd scripts/my_model
python servidor_flask.py  # Ver output directo
```

## 🚀 Despliegue en Producción

### Preparación
```bash
# 1. Configurar .env para producción
APP_ENV=production
APP_DEBUG=false

# 2. Generar clave segura
php artisan key:generate

# 3. Optimizar para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache
npm run build
```

### Recomendaciones de Seguridad
- Usar HTTPS en producción
- Configurar firewall (solo puertos 80, 443)
- Actualizar regularmente las dependencias
- Usar variables de entorno seguras
- Configurar backup automático de base de datos
- Monitorear logs de seguridad


---

**Desarrollado con ❤️ para la detección inteligente de plagas**
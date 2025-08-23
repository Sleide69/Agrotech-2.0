# ========================================
# 🐳 Scripts de Utilidad Docker - MundoVerde
# ========================================

# Función para mostrar el estado de los contenedores
function Show-DockerStatus {
    Write-Host "📊 Estado de contenedores MundoVerde:" -ForegroundColor Cyan
    docker-compose ps
}

# Función para ver logs en tiempo real
function Show-AppLogs {
    Write-Host "📋 Mostrando logs de la aplicación..." -ForegroundColor Green
    docker-compose logs -f app
}

# Función para acceder al contenedor de la aplicación
function Enter-AppContainer {
    Write-Host "🔧 Accediendo al contenedor de la aplicación..." -ForegroundColor Yellow
    docker exec -it Clima-MundoVerde-app sh
}

# Función para acceder a la base de datos
function Enter-Database {
    Write-Host "🗄️  Accediendo a PostgreSQL..." -ForegroundColor Blue
    docker exec -it Clima-MundoVerde-db psql -U postgres -d ClimaMundoverde-db
}

# Función para limpiar todo
function Clean-All {
    Write-Host "🧹 Limpiando completamente el entorno Docker..." -ForegroundColor Red
    docker-compose down -v --remove-orphans
    docker system prune -f
    Write-Host "✅ Limpieza completada" -ForegroundColor Green
}

# Función para setup inicial
function Initialize-Development {
    Write-Host "🚀 Inicializando entorno de desarrollo..." -ForegroundColor Magenta
    
    # Verificar que Docker esté ejecutándose
    if (-not (Get-Process "Docker Desktop" -ErrorAction SilentlyContinue)) {
        Write-Host "⚠️  Docker Desktop no está ejecutándose. Por favor, inícialo primero." -ForegroundColor Red
        return
    }
    
    # Construir y levantar servicios
    Write-Host "📦 Construyendo contenedores..." -ForegroundColor Yellow
    docker-compose build
    
    Write-Host "🏃 Levantando servicios..." -ForegroundColor Yellow
    docker-compose up -d
    
    Write-Host "⏳ Esperando que los servicios estén listos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Show-DockerStatus
    
    Write-Host "✅ Entorno de desarrollo listo!" -ForegroundColor Green
    Write-Host "🌐 Aplicación disponible en: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "📊 Base de datos disponible en: localhost:5432" -ForegroundColor Cyan
}

# Mostrar ayuda
function Show-Help {
    Write-Host @"
🐳 Comandos disponibles para Docker MundoVerde:

📊 Gestión de servicios:
   Initialize-Development    - Configurar e iniciar todo el entorno
   Show-DockerStatus        - Ver estado de contenedores
   npm run docker:up        - Levantar servicios
   npm run docker:down      - Parar servicios
   npm run docker:rebuild   - Rebuild completo

📋 Debugging:
   Show-AppLogs            - Ver logs de la aplicación
   Enter-AppContainer      - Acceder al contenedor de la app
   Enter-Database          - Acceder a PostgreSQL
   npm run docker:logs     - Logs desde npm

🧹 Mantenimiento:
   Clean-All               - Limpiar todo completamente
   npm run docker:clean    - Limpiar desde npm

🔍 URLs importantes:
   http://localhost:3000   - Aplicación
   localhost:5432          - Base de datos

"@ -ForegroundColor White
}

# Exportar funciones
Export-ModuleMember -Function Initialize-Development, Show-DockerStatus, Show-AppLogs, Enter-AppContainer, Enter-Database, Clean-All, Show-Help

Write-Host "🐳 Scripts de Docker MundoVerde cargados. Ejecuta 'Show-Help' para ver comandos disponibles." -ForegroundColor Green

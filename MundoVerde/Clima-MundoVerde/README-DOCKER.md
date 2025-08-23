# 🐳 Configuración Docker para Desarrollo - MundoVerde

## 📋 Prerrequisitos

- Docker Desktop instalado y ejecutándose
- Docker Compose (incluido con Docker Desktop)

## 🚀 Comandos Rápidos

### Levantar todo el entorno de desarrollo
```bash
npm run docker:up
```

### Levantar en modo detached (en segundo plano)
```bash
npm run docker:up-d
```

### Ver logs de la aplicación
```bash
npm run docker:logs
```

### Parar todos los servicios
```bash
npm run docker:down
```

### Limpiar completamente (incluye volúmenes)
```bash
npm run docker:clean
```

### Rebuild completo (si cambias dependencias)
```bash
npm run docker:rebuild
```

## 🏗️ Servicios Incluidos

### 📊 Base de Datos PostgreSQL
- **Puerto:** 5432 (expuesto en localhost)
- **Usuario:** postgres
- **Contraseña:** 2025*_*
- **Base de Datos:** ClimaMundoverde-db
- **Volumen persistente:** Los datos se conservan entre reinicios

### 🌐 Aplicación Node.js
- **Puerto:** 3000 (expuesto en localhost)
- **Hot Reload:** ✅ Activado (los cambios en `src/` se reflejan automáticamente)
- **Debug:** ✅ Disponible
- **WebSocket:** ✅ Funcional

## 🔧 Configuración de Desarrollo

### Variables de Entorno
Las variables se configuran automáticamente para Docker:
- `DB_HOST=db` (servicio interno)
- `DB_PORT=5432`
- `NODE_ENV=development`

### Volúmenes Montados
- `./src` → Hot reload del código fuente
- `./package.json` → Detección de cambios en dependencias
- `./tsconfig.json` → Configuración TypeScript

## 🐛 Debugging

### Conectarse al contenedor de la aplicación
```bash
docker exec -it Clima-MundoVerde-app sh
```

### Ver logs en tiempo real
```bash
docker-compose logs -f app
```

### Ver logs de la base de datos
```bash
docker-compose logs -f db
```

## 🛠️ Desarrollo

### Cuando agregues nuevas dependencias
1. Agrega la dependencia al `package.json`
2. Ejecuta: `npm run docker:rebuild`

### Para acceso directo a la BD (si necesitas)
```bash
docker exec -it Clima-MundoVerde-db psql -U postgres -d ClimaMundoverde-db
```

## 📍 URLs de Acceso

- **Aplicación:** http://localhost:3000
- **WebSocket:** ws://localhost:3000
- **API Docs:** http://localhost:3000/api-docs (si tienes Swagger configurado)
- **Base de Datos:** localhost:5432

### 🔓 API Endpoints (Todos Públicos - JWT Desactivado)
- **Health Check:** http://localhost:3000/health
- **Consulta Clima:** http://localhost:3000/api/consulta-clima?ciudad=Quito
- **Fuentes:** http://localhost:3000/api/fuentes  
- **Logs:** http://localhost:3000/api/logs
- **API Tester:** Abre `api-tester.html` en tu navegador

## 🚨 Solución de Problemas

### Si el contenedor de la app no inicia
```bash
npm run docker:logs
```

### Si hay problemas con la BD
```bash
docker-compose restart db
```

### Limpiar todo y empezar de cero
```bash
npm run docker:clean
npm run docker:up
```

### Error de permisos en Windows
Si tienes problemas con volúmenes, asegúrate de que Docker Desktop tenga permisos para acceder a tu unidad C:.

## 📝 Notas Importantes

- ✅ **Base de datos NO expuesta externamente** (solo accesible desde la aplicación)
- ✅ **Hot reload activado** para desarrollo ágil
- ✅ **Volúmenes persistentes** para datos de BD
- ✅ **Red interna** para comunicación segura entre servicios
- ✅ **Health checks** para asegurar que la BD esté lista antes de iniciar la app

# Configuración de SQLite

## Cambios realizados para migrar de PostgreSQL a SQLite:

### 1. Dependencias actualizadas
- ✅ Agregado `sqlite3` al package.json
- ✅ Mantenido `typeorm` para ORM

### 2. Configuración de DataSource
- ✅ Cambiado type de 'postgres' a 'sqlite'
- ✅ Configurado database path: `./database.sqlite`
- ✅ Eliminadas configuraciones de host, port, username, password

### 3. Variables de entorno
- ✅ `DB_PATH` - Ruta del archivo SQLite (por defecto: `./database.sqlite`)
- ✅ Eliminadas variables de PostgreSQL (DB_HOST, DB_PORT, etc.)

### 4. Tipos de datos optimizados para SQLite
- ✅ Cambiado `decimal` a `real` para números decimales
- ✅ Mantenidos otros tipos compatibles

### 5. Instalación y uso

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
cp .env.example .env

# Ejecutar en desarrollo
npm run dev
```

### 6. Estructura de archivos SQLite
- El archivo `database.sqlite` se creará automáticamente en la raíz del proyecto
- Las tablas se crearán automáticamente gracias a `synchronize: true` en desarrollo
- En producción, usar migraciones de TypeORM

### 7. Ventajas de SQLite para este proyecto:
- ✅ Sin necesidad de servidor de base de datos externo
- ✅ Archivo único y portable
- ✅ Ideal para desarrollo y pruebas
- ✅ Menos configuración necesaria
- ✅ Mejor para aplicaciones con tráfico moderado

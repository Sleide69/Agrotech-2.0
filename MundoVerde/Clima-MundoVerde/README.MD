# 🌱 Clima-MundoVerde

Clima-MundoVerde es una API REST desarrollada en TypeScript y Express que permite consultar datos climáticos en tiempo real desde OpenWeather API. Los resultados se almacenan en Supabase (PostgreSQL) para fines de auditoría y análisis posteriores.

## 📦 Tecnologías Utilizadas

- Node.js + Express
- TypeScript
- TypeORM
- Supabase (PostgreSQL gestionado)
- OpenWeather API
- Axios
- Dotenv
- CORS
- JWT (para autenticación)
- Jest + Supertest (para testing)

## 🔧 Requisitos Previos

- Node.js ≥ 18.x
- Docker Compose
- Cuenta gratuita en OpenWeatherMap (para obtener una API key)

## 🚀 Instalación y Ejecución

### Clonar el repositorio
```bash
git clone https://github.com/EZMayk/MundoVerde.git
cd MundoVerde
```

### Instalación de dependencias
```bash
npm install
```

### Configuración del entorno
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
```env
DB_HOST=aws-0-us-east-2.pooler.supabase.com
DB_PORT=6543
DB_USERNAME=postgres.xsdzrbphlibhwmegavsc
DB_PASSWORD=Menendez2025*_*
DB_DATABASE=postgres
PORT=3000
OPENWEATHER_API_KEY=fbf0bedef7d799633876a3253f1e575a
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5/weather
```

### Instalación de JWT
```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### Instalación de Jest para pruebas
```bash
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest
```
### incia la configuracion de jest
```
npx ts-jest config:init
```

### instalacion de supertest para simular peticiones HTTP a tu servidor Express para los test de routes.
```bash
npm install --save-dev supertest @types/supertest
```

### Ejecución del proyecto

#### Opción 1: Ejecución local
```bash
npm run dev
```

#### Opción 2: Ejecución con Docker (Recomendado para desarrollo)
```bash
# Levantar todo el entorno (BD + Aplicación)
npm run docker:up

# Ver logs de la aplicación
npm run docker:logs

# Parar servicios
npm run docker:down
```

El servidor estará disponible en: `http://localhost:3000`

## � Autenticación JWT (DESACTIVADA)

**Nota:** La autenticación JWT está actualmente desactivada. Todas las rutas son públicas y no requieren token.

### Todos los endpoints son públicos:
- `GET /health` - Health check
- `GET /health/readiness` - Readiness probe  
- `GET /health/liveness` - Liveness probe
- `POST /api/auth/login` - Autenticación (disponible pero no requerida)
- `GET /api/consulta-clima` - **Ahora público**
- `GET /api/fuentes` - **Ahora público**
- `GET /api/logs` - **Ahora público**

### Para reactivar JWT:
Descomenta la línea `app.use(verificarToken);` en `src/app.ts`

## 🧪 Testing de la API

Abre `api-tester.html` en tu navegador para una interfaz gráfica de testing.

## 🐳 Docker para Desarrollo

Ver `README-DOCKER.md` para instrucciones detalladas de Docker.

## 📂 Estructura Principal del Proyecto
```text
├── src/
│   ├── config/
│   ├── controllers/
│   ├── dtos/
│   ├── entities/
│   ├── middlewares/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── test/
│   ├── utils/
│   ├── app.ts
├── tests/
├── .env
├── .gitignore
├── docker-compose.yml
├── package-lock.json
├── package.json
├── README.MD
└── tsconfig.json
```

## 📡 Endpoints Disponibles

### Consultar Clima Actual
- **Método:** GET  
- **URL:** `/api/consulta-clima?ciudad=Guayaquil`

#### Parámetros:
- `ciudad` (string) → Nombre de la ciudad a consultar.

✔️ Este endpoint:
- Consulta la API de OpenWeather.
- Guarda los datos en Supabase.
- Registra la consulta en la base de datos.
- Almacena un log de la consulta.

### Obtener Fuentes Climáticas
- **Método:** GET  
- **URL:** `/api/fuentes`

### Obtener Logs de Consultas
- **Método:** GET  
- **URL:** `/api/logs`

#### Parámetros opcionales:
- `ciudad` → Filtra por ciudad.
- `resultado` → Filtra por "éxito" o "error".
- `fuente` → Filtra por fuente climática.

#### Ejemplo sin filtros:
```http
GET http://localhost:3000/api/logs
```

#### Ejemplo con filtros:
```http
GET http://localhost:3000/api/logs?ciudad=Quito&resultado=éxito
```

## ✅ Pruebas Unitarias y de Integración
Para ejecutar las pruebas:
```bash
npm test
```

## 📜 Scripts disponibles en package.json
```json
"scripts": {
  "dev": "nodemon --exec ts-node src/app.ts",
  "start": "ts-node-dev src/app.ts",
  "test": "jest"
}
```

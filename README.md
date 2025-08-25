# Agrotech-2.0 Monorepo

Sistema de monitoreo de cultivos con microservicios, orquestado con Docker, API Gateway y una base de datos Postgres única (Supabase).

## Servicios
- api-gateway (Node/TS) – puerto público 8088
- cultivo-manager (Spring Boot) – puerto interno 8080
- sensor-service (FastAPI) – puerto interno 6060
- plaga-service (Python/HTTP) – puerto interno 8000
- mqtt-broker (Mosquitto) – 1883
- frontend (Next.js) – 3001 (opcional)

## Requisitos
- Docker y Docker Compose
- Una instancia de Postgres (recomendado Supabase). Configure `DATABASE_URL`.

## Variables de entorno
Copie `.env.example` a `.env` en la raíz y complete:
- `DATABASE_URL`
- `SUPABASE_JWT_SECRET`/`SUPABASE_JWKS_URL` si usará tokens de Supabase
- `MQTT_BROKER_URL` si usa un broker externo

## Levantar
- make build
- make seed  # crea esquemas y seeds básicos
- make up
- make logs

Gateway: http://localhost:8088
Frontend: http://localhost:3001 (si está habilitado)

## Conexión a DB única
Todos los servicios leen `DATABASE_URL`. Las migraciones iniciales están en `db/migrations`.

## IoT Ingesta
- MQTT: tópico `sensors/+/data`. El servicio de sensores debe suscribirse y persistir en `telemetry.lecturas`.
- HTTP: POST `/api/v1/ingest` (pendiente de completar) con cabeceras `x-device-id`, `x-signature`, `x-timestamp`.

## Observabilidad
- Cada servicio debe exponer `/health` y `/readiness`.
- El gateway incluye `/gateway/health` y `/gateway/info`.

## Notas
- Evite hardcodear `localhost` en el gateway; se usan variables de entorno.
- Los Dockerfile por servicio usan Node 20, Python 3.11 slim, JDK 17.
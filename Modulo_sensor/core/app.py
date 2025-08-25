"""
Aplicación FastAPI principal
"""
from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import json
import time
from typing import Optional
import hmac
import hashlib

from core.settings import get_settings
from core.database import create_tables, engine
from api.v1.router import api_router
from auth.router import router as auth_router 
from sqlalchemy import text

try:
    import paho.mqtt.client as mqtt
except Exception:
    mqtt = None  # opcional si no está instalado


# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestiona el ciclo de vida de la aplicación"""
    # Startup
    logger.info("Iniciando aplicación...")
    create_tables()
    # Iniciar MQTT si está disponible
    client = None
    if mqtt:
        try:
            broker_url = settings.MQTT_BROKER_URL.replace('mqtt://', '')
            host, port = (broker_url.split(':') + ['1883'])[:2]
            client = mqtt.Client()
            if settings.MQTT_USERNAME:
                client.username_pw_set(settings.MQTT_USERNAME, settings.MQTT_PASSWORD)

            def on_connect(cl, userdata, flags, rc):
                logger.info(f"MQTT conectado rc={rc}, suscribiendo a sensors/+/data")
                cl.subscribe("sensors/+/data")

            def on_message(cl, userdata, msg):
                try:
                    payload = msg.payload.decode('utf-8')
                    data = json.loads(payload)
                    device_id = data.get('device_id')
                    metric = data.get('metric')
                    value = float(data.get('value'))
                    ts = data.get('ts')  # opcional
                    metadata = json.dumps(data.get('metadata', {}))
                    # Persistir con SQL raw para performance
                    with engine.begin() as conn:
                        conn.execute(text(
                            """
                            insert into telemetry.lecturas(sensor_id, ts, metric, value, metadata)
                            select s.id, coalesce(to_timestamp(:ts), now()), :metric, :value, :metadata::jsonb
                            from core.sensores s
                            where s.device_id = :device_id
                            """
                        ), { 'ts': ts, 'metric': metric, 'value': value, 'metadata': metadata, 'device_id': device_id })
                    logger.info(f"MQTT lectura persistida: {device_id} {metric}={value}")
                except Exception as e:
                    logger.exception(f"Error procesando mensaje MQTT: {e}")

            client.on_connect = on_connect
            client.on_message = on_message
            client.connect(host, int(port))
            client.loop_start()
        except Exception as e:
            logger.exception(f"No se pudo iniciar cliente MQTT: {e}")
    logger.info("Aplicación iniciada correctamente")
    
    yield
    
    # Shutdown
    logger.info("Cerrando aplicación...")

def create_app() -> FastAPI:
    """Factory para crear la aplicación FastAPI"""
    
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        debug=settings.DEBUG,
        lifespan=lifespan
    )

    # Configuración de CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=settings.ALLOW_CREDENTIALS,
        allow_methods=settings.ALLOWED_METHODS,
        allow_headers=settings.ALLOWED_HEADERS,
    )

    # Incluir routers
    app.include_router(api_router, prefix="/api/v1")
    app.include_router(auth_router, prefix="/auth")


    @app.get("/health")
    def health_check():
        """Endpoint de salud"""
        return {"status": "healthy", "version": settings.APP_VERSION}

    @app.get("/readiness")
    def readiness():
        try:
            with engine.connect() as conn:
                conn.execute(text("select 1"))
            return {"ready": True}
        except Exception:
            raise HTTPException(status_code=503, detail="not ready")

    @app.post("/api/v1/ingest")
    def ingest(payload: dict, x_device_id: Optional[str] = Header(None), x_signature: Optional[str] = Header(None), x_timestamp: Optional[str] = Header(None)):
        if not x_device_id:
            raise HTTPException(status_code=400, detail="x-device-id requerido")
        # Validación de firma HMAC simple
        metric = payload.get('metric')
        value = payload.get('value')
        ts = payload.get('ts') or time.time()
        metadata = json.dumps(payload.get('metadata', {}))
        if metric is None or value is None:
            raise HTTPException(status_code=400, detail="metric y value requeridos")
        with engine.begin() as conn:
            res = conn.execute(text("select id, secret from core.sensores where device_id=:d and activo=true"), { 'd': x_device_id }).first()
            if not res:
                raise HTTPException(status_code=404, detail="device no registrado")
            # Validar firma si viene en headers y hay secret
            secret = (res.secret or '').encode('utf-8') if hasattr(res, 'secret') else b''
            if x_signature and secret:
                msg = f"{int(float(ts))}|{metric}|{value}"
                expected = hmac.new(secret, msg.encode('utf-8'), hashlib.sha256).hexdigest()
                if not hmac.compare_digest(expected, x_signature):
                    raise HTTPException(status_code=401, detail="firma inválida")
            conn.execute(text(
                """
                insert into telemetry.lecturas(sensor_id, ts, metric, value, metadata)
                values (:sid, to_timestamp(:ts), :metric, :value, :metadata::jsonb)
                """
            ), { 'sid': res.id, 'ts': ts, 'metric': metric, 'value': float(value), 'metadata': metadata })
        return {"ok": True}

    return app

# Instancia de la aplicación
app = create_app()

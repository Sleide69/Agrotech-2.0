# Integración API Gateway - WebSocket

## Configuración del API Gateway

Para que el sistema funcione correctamente, el API Gateway debe configurarse para:

1. **Registrar el servicio WebSocket**
2. **Enrutar eventos de microservicios al WebSocket**
3. **Manejar webhooks hacia el WebSocket**

## Endpoints del API Gateway Requeridos

### 1. Registro del Servicio WebSocket

**POST** `/websocket/register`

```json
{
  "serviceName": "websocket-notifications",
  "endpoint": "http://localhost:3000",
  "events": [
    "cultivo.created", "cultivo.updated", "cultivo.deleted",
    "plaga.detected", "plaga.treated", "plaga.resolved",
    "clima.alert", "clima.forecast", "clima.anomaly",
    "sensor.reading", "sensor.alert", "sensor.offline",
    "exportacion.created", "exportacion.shipped", "exportacion.delivered"
  ]
}
```

### 2. Suscripción a Eventos de Microservicios

**POST** `/events/subscribe`

```json
{
  "subscriber": "websocket-notifications",
  "service": "gestion-cultivo",
  "events": ["cultivo.created", "cultivo.updated", "cultivo.deleted"],
  "webhookUrl": "http://localhost:3000/webhook/events"
}
```

### 3. Notificación de Estado del WebSocket

**POST** `/websocket/status`

```json
{
  "service": "websocket-notifications",
  "status": "online",
  "connectedClients": 15,
  "timestamp": "2025-07-24T10:30:00Z"
}
```

## Configuración de Microservicios

Cada microservicio debe configurarse para enviar eventos al API Gateway cuando ocurran cambios:

### Microservicio de Gestión de Cultivos

```javascript
// Ejemplo en Node.js/Express
const axios = require('axios');

class CultivoService {
  async crearCultivo(cultivoData) {
    try {
      // Crear cultivo en base de datos
      const cultivo = await this.repository.create(cultivoData);
      
      // Enviar evento al API Gateway
      await this.publishEvent({
        service: 'gestion-cultivo',
        eventType: 'cultivo.created',
        data: {
          id: cultivo.id,
          nombre: cultivo.nombre,
          tipo: cultivo.tipo,
          fechaPlantacion: cultivo.fechaPlantacion,
          estado: cultivo.estado,
          ubicacion: cultivo.ubicacion
        },
        timestamp: new Date(),
        id: `cultivo-${cultivo.id}-${Date.now()}`
      });
      
      return cultivo;
    } catch (error) {
      console.error('Error creando cultivo:', error);
      throw error;
    }
  }
  
  async publishEvent(event) {
    try {
      await axios.post('http://api-gateway:3001/events/publish', event);
    } catch (error) {
      console.error('Error publicando evento:', error);
    }
  }
}
```

### Microservicio de Detección de Plagas

```javascript
class PlagaService {
  async detectarPlaga(detectionData) {
    try {
      // Procesar detección de plaga
      const plaga = await this.processDetection(detectionData);
      
      // Enviar evento de alta prioridad
      await this.publishEvent({
        service: 'plaga',
        eventType: 'plaga.detected',
        data: {
          id: plaga.id,
          tipo: plaga.tipo,
          severidad: plaga.severidad,
          cultivoId: plaga.cultivoId,
          ubicacion: plaga.ubicacion,
          descripcion: plaga.descripcion,
          imagenes: plaga.imagenes
        },
        timestamp: new Date(),
        id: `plaga-${plaga.id}-${Date.now()}`
      });
      
      return plaga;
    } catch (error) {
      console.error('Error detectando plaga:', error);
      throw error;
    }
  }
}
```

### Microservicio de Sensores

```javascript
class SensorService {
  async procesarLectura(sensorId, valor, unidad) {
    try {
      const sensor = await this.repository.findById(sensorId);
      const lectura = await this.saveLectura(sensorId, valor, unidad);
      
      // Verificar si hay alerta
      const alerta = this.checkThresholds(sensor, valor);
      
      // Enviar evento
      await this.publishEvent({
        service: 'sensores',
        eventType: alerta ? 'sensor.alert' : 'sensor.reading',
        data: {
          sensorId: sensorId,
          tipo: sensor.tipo,
          valor: valor,
          unidad: unidad,
          cultivoId: sensor.cultivoId,
          alerta: !!alerta,
          umbralSuperado: alerta?.umbralSuperado || false
        },
        timestamp: new Date(),
        id: `sensor-${sensorId}-${Date.now()}`
      });
      
      return lectura;
    } catch (error) {
      console.error('Error procesando lectura de sensor:', error);
      throw error;
    }
  }
}
```

## Configuración del API Gateway (Express.js)

```javascript
const express = require('express');
const axios = require('axios');
const app = express();

// Almacén de servicios registrados
const registeredServices = new Map();
const eventSubscriptions = new Map();

// Registro de servicios WebSocket
app.post('/websocket/register', (req, res) => {
  const { serviceName, endpoint, events } = req.body;
  
  registeredServices.set(serviceName, {
    endpoint,
    events,
    registeredAt: new Date(),
    status: 'online'
  });
  
  console.log(`Servicio WebSocket registrado: ${serviceName}`);
  res.json({ success: true, message: 'Servicio registrado exitosamente' });
});

// Suscripción a eventos
app.post('/events/subscribe', (req, res) => {
  const { subscriber, service, events, webhookUrl } = req.body;
  
  const subscriptionKey = `${subscriber}-${service}`;
  eventSubscriptions.set(subscriptionKey, {
    subscriber,
    service,
    events,
    webhookUrl,
    subscribedAt: new Date()
  });
  
  console.log(`Suscripción creada: ${subscriptionKey}`);
  res.json({ success: true, message: 'Suscripción creada exitosamente' });
});

// Publicación de eventos
app.post('/events/publish', async (req, res) => {
  const event = req.body;
  
  try {
    // Encontrar suscriptores para este evento
    const subscribers = findSubscribersForEvent(event);
    
    // Enviar evento a cada suscriptor
    const promises = subscribers.map(sub => 
      sendEventToSubscriber(sub, event)
    );
    
    await Promise.allSettled(promises);
    
    res.json({ success: true, message: 'Evento publicado' });
  } catch (error) {
    console.error('Error publicando evento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function findSubscribersForEvent(event) {
  const subscribers = [];
  
  for (const [key, subscription] of eventSubscriptions.entries()) {
    if (subscription.service === event.service && 
        subscription.events.includes(event.eventType)) {
      subscribers.push(subscription);
    }
  }
  
  return subscribers;
}

async function sendEventToSubscriber(subscription, event) {
  try {
    await axios.post(subscription.webhookUrl, event, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Gateway-Signature': generateSignature(event)
      }
    });
    
    console.log(`Evento enviado a ${subscription.subscriber}`);
  } catch (error) {
    console.error(`Error enviando evento a ${subscription.subscriber}:`, error.message);
  }
}

// Proxy para microservicios
app.get('/gestion-cultivo/*', async (req, res) => {
  try {
    const response = await axios.get(`http://gestion-cultivo:3002${req.path}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error conectando con servicio de cultivos' });
  }
});

app.get('/sensores/*', async (req, res) => {
  try {
    const response = await axios.get(`http://sensores:3004${req.path}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error conectando con servicio de sensores' });
  }
});

app.listen(3001, () => {
  console.log('API Gateway ejecutándose en puerto 3001');
});
```

## Docker Compose para el Sistema Completo

```yaml
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    depends_on:
      - redis
      - postgres

  websocket-service:
    build: ./web-socket
    ports:
      - "3000:3000"
    environment:
      - API_GATEWAY_URL=http://api-gateway:3001
      - WEBSOCKET_URL=http://websocket-service:3000
    depends_on:
      - api-gateway

  gestion-cultivo:
    build: ./microservices/gestion-cultivo
    ports:
      - "3002:3002"
    environment:
      - API_GATEWAY_URL=http://api-gateway:3001
      - DATABASE_URL=postgresql://user:pass@postgres:5432/cultivos
    depends_on:
      - postgres

  sensores-service:
    build: ./microservices/sensores
    ports:
      - "3004:3004"
    environment:
      - API_GATEWAY_URL=http://api-gateway:3001
      - DATABASE_URL=postgresql://user:pass@postgres:5432/sensores
    depends_on:
      - postgres

  plaga-service:
    build: ./microservices/plaga
    ports:
      - "3006:3006"
    environment:
      - API_GATEWAY_URL=http://api-gateway:3001
      - DATABASE_URL=postgresql://user:pass@postgres:5432/plagas
    depends_on:
      - postgres

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=agriculture
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Scripts de Prueba

### Simular evento de cultivo
```bash
curl -X POST http://localhost:3001/events/publish \
  -H "Content-Type: application/json" \
  -d '{
    "service": "gestion-cultivo",
    "eventType": "cultivo.created",
    "data": {
      "id": "cultivo-123",
      "nombre": "Tomates Cherry",
      "tipo": "Hortaliza",
      "fechaPlantacion": "2025-07-24T00:00:00Z",
      "estado": "plantado",
      "ubicacion": {
        "lat": -34.6037,
        "lng": -58.3816
      }
    },
    "timestamp": "2025-07-24T10:30:00Z",
    "id": "event-123"
  }'
```

### Simular detección de plaga
```bash
curl -X POST http://localhost:3001/events/publish \
  -H "Content-Type: application/json" \
  -d '{
    "service": "plaga",
    "eventType": "plaga.detected",
    "data": {
      "id": "plaga-456",
      "tipo": "Pulgón",
      "severidad": "alta",
      "cultivoId": "cultivo-123",
      "ubicacion": {
        "lat": -34.6037,
        "lng": -58.3816
      },
      "descripcion": "Detección de pulgones en hojas superiores"
    },
    "timestamp": "2025-07-24T10:35:00Z",
    "id": "event-456"
  }'
```

Esta configuración permite que tu sistema de WebSocket se integre completamente con un API Gateway y reciba notificaciones en tiempo real de todos los microservicios de tu sistema agrícola.

# Cliente WebSocket - Sistema de Notificaciones Agrícolas

## Conexión al WebSocket

### JavaScript/TypeScript
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling']
});

// Escuchar conexión establecida
socket.on('connected', (data) => {
  console.log('Conectado:', data);
});
```

### React Hook personalizado
```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useAgricultureWebSocket = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(url);
    
    newSocket.on('connect', () => {
      setConnected(true);
      console.log('WebSocket conectado');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('WebSocket desconectado');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [url]);

  return { socket, connected };
};
```

## Suscripción a Cultivos

```javascript
// Suscribirse a notificaciones de un cultivo específico
socket.emit('subscribe_cultivo', { cultivoId: 'cultivo-123' });

// Escuchar confirmación de suscripción
socket.on('subscription_result', (result) => {
  if (result.success) {
    console.log(`Suscrito a ${result.cultivoId}`);
  } else {
    console.error(`Error: ${result.message}`);
  }
});

// Desuscribirse de un cultivo
socket.emit('unsubscribe_cultivo', { cultivoId: 'cultivo-123' });
```

## Eventos de Cultivos

### Nuevo Cultivo
```javascript
socket.on('cultivation:new', (notification) => {
  console.log('Nuevo cultivo:', notification.data);
  // notification.data contiene:
  // {
  //   id: string,
  //   nombre: string,
  //   tipo: string,
  //   fechaPlantacion: Date,
  //   estado: string,
  //   ubicacion?: { lat: number, lng: number }
  // }
});
```

### Cultivo Actualizado
```javascript
socket.on('cultivation:updated', (notification) => {
  console.log('Cultivo actualizado:', notification.data);
});
```

### Cultivo Eliminado
```javascript
socket.on('cultivation:deleted', (notification) => {
  console.log('Cultivo eliminado:', notification.data);
});
```

## Eventos de Plagas

### Detección de Plaga
```javascript
socket.on('pest:detected', (notification) => {
  console.log('Plaga detectada:', notification.data);
  
  const { tipo, severidad, cultivoId, ubicacion, descripcion } = notification.data;
  
  // Mostrar alerta según severidad
  if (severidad === 'critica' || severidad === 'alta') {
    showCriticalAlert(notification);
  }
});
```

### Plaga Crítica (Broadcast global)
```javascript
socket.on('pest:critical', (notification) => {
  // Recibido por todos los clientes para plagas críticas
  showEmergencyAlert(notification);
});
```

### Tratamiento y Resolución
```javascript
socket.on('pest:treated', (notification) => {
  console.log('Plaga tratada:', notification.data);
});

socket.on('pest:resolved', (notification) => {
  console.log('Plaga resuelta:', notification.data);
});
```

## Eventos de Sensores

### Datos de Sensores
```javascript
socket.on('sensor:data', (notification) => {
  const { sensorId, tipo, valor, unidad, cultivoId } = notification.data;
  
  // Actualizar dashboard con nuevos datos
  updateSensorDisplay(sensorId, valor, unidad);
});
```

### Alertas de Sensores
```javascript
socket.on('sensor:alert', (notification) => {
  const { sensorId, valor, umbralSuperado } = notification.data;
  
  if (umbralSuperado) {
    showSensorAlert(`Sensor ${sensorId}: Valor ${valor} fuera del rango normal`);
  }
});
```

## Eventos de Clima

```javascript
socket.on('clima:alert', (notification) => {
  const { alerta } = notification.data;
  showWeatherAlert(alerta.mensaje, alerta.nivel);
});

socket.on('clima:forecast', (notification) => {
  updateWeatherForecast(notification.data);
});
```

## Eventos de Exportación

```javascript
socket.on('exportacion:created', (notification) => {
  console.log('Nueva exportación:', notification.data);
});

socket.on('exportacion:shipped', (notification) => {
  console.log('Exportación enviada:', notification.data);
});

socket.on('exportacion:delivered', (notification) => {
  console.log('Exportación entregada:', notification.data);
});
```

## Utilidades del Sistema

### Estadísticas del Sistema
```javascript
socket.emit('get_system_stats');

socket.on('system:stats', (stats) => {
  console.log('Estadísticas:', stats);
  // stats contiene: connectedClients, timestamp, uptime
});
```

### Ping/Pong para verificar conexión
```javascript
socket.emit('ping');

socket.on('pong', (response) => {
  console.log('Latencia:', Date.now() - response.timestamp);
});
```

### Datos Iniciales al Suscribirse
```javascript
// Al suscribirse a un cultivo, recibirás datos iniciales
socket.on('cultivo:initial_data', (data) => {
  console.log('Datos iniciales del cultivo:', data);
});

socket.on('sensores:initial_data', (data) => {
  console.log('Sensores del cultivo:', data.sensores);
});
```

## Ejemplo Completo de Integración

```typescript
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  type: string;
  event: string;
  data: any;
  timestamp: Date;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

const AgricultureDashboard: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [subscribedCultivos, setSubscribedCultivos] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');

    // Configurar listeners
    newSocket.on('connected', (data) => {
      console.log('Conectado al sistema de notificaciones:', data);
    });

    // Eventos de cultivos
    newSocket.on('cultivation:new', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      showToast('Nuevo cultivo creado', 'success');
    });

    // Eventos de plagas
    newSocket.on('pest:detected', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      if (notification.priority === 'critical' || notification.priority === 'high') {
        showAlert('Plaga detectada', notification.data.descripcion, 'error');
      }
    });

    // Eventos de sensores
    newSocket.on('sensor:alert', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      showToast('Alerta de sensor', 'warning');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const subscribeToCultivo = (cultivoId: string) => {
    if (socket) {
      socket.emit('subscribe_cultivo', { cultivoId });
      setSubscribedCultivos(prev => [...prev, cultivoId]);
    }
  };

  return (
    <div>
      {/* Tu dashboard aquí */}
      <NotificationsList notifications={notifications} />
      <CultivoSubscription onSubscribe={subscribeToCultivo} />
    </div>
  );
};
```

## Manejo de Errores y Reconexión

```javascript
socket.on('connect_error', (error) => {
  console.error('Error de conexión:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Desconectado:', reason);
  
  if (reason === 'io server disconnect') {
    // Reconexión manual necesaria
    socket.connect();
  }
  // Para otros casos, socket.io maneja la reconexión automáticamente
});
```

## Configuración de Producción

Para producción, asegúrate de:

1. Usar HTTPS/WSS en lugar de HTTP/WS
2. Configurar CORS apropiadamente
3. Implementar autenticación/autorización
4. Configurar rate limiting
5. Usar un load balancer para múltiples instancias
6. Implementar logging y monitoreo

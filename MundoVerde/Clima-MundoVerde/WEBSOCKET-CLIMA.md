# 🌤️ WebSocket Clima - MundoVerde

## 📋 Descripción

Esta documentación describe la implementación del sistema WebSocket para el módulo de clima en MundoVerde. El sistema permite recibir actualizaciones de datos climáticos en tiempo real y generar alertas automáticas basadas en condiciones extremas.

## 🔧 Implementación

### 1. Servicio WebSocket (`websocket.service.ts`)

El servicio principal que maneja todas las conexiones y eventos WebSocket:

```typescript
// Eventos principales del módulo clima:
- weather:updated     // Actualización de datos climáticos
- weather:alert       // Alertas por condiciones extremas  
- weather:affects-crop // Eventos que impactan cultivos
- dashboard:real-time // Actualizaciones del dashboard
```

### 2. Integración en ConsultaClima.service.ts

El servicio de consulta clima ha sido actualizado para emitir eventos WebSocket automáticamente:

#### ✅ **Características implementadas:**

- **Emisión automática de eventos**: Cada consulta de clima genera eventos WebSocket
- **Cálculo de severidad**: Evalúa condiciones climáticas (low, medium, high, critical)
- **Alertas automáticas**: Genera alertas cuando se detectan condiciones críticas
- **Manejo de errores**: Emite eventos de error a través de WebSocket

#### 🔄 **Flujo de funcionamiento:**

1. **Cliente hace consulta** → `/api/consulta-clima?ciudad=Bogotá`
2. **Servicio obtiene datos** → API externa (OpenWeather)
3. **Datos se guardan** → Base de datos
4. **Evento WebSocket emitido** → `weather:updated`
5. **Cliente recibe actualización** → En tiempo real

### 3. Tipos de Eventos (`events.types.ts`)

```typescript
interface WeatherEvent {
    ciudad: string;
    temperatura: number;
    humedad: number;
    presion: number;
    descripcion: string;
    viento: number;
    precipitacion?: number;
    timestamp: Date;
    fuenteNombre: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
```

### 4. Cálculo de Severidad

El sistema evalúa la severidad basándose en:

#### 🌡️ **Temperatura:**
- **Crítico**: > 40°C o < -10°C
- **Alto**: > 35°C o < 0°C  
- **Medio**: > 30°C o < 5°C

#### 💧 **Humedad:**
- **Alto**: > 90% o < 10%
- **Medio**: > 80% o < 20%

#### 💨 **Viento:**
- **Crítico**: > 25 m/s
- **Alto**: > 15 m/s
- **Medio**: > 10 m/s

## 🧪 Pruebas

### 1. Página de Prueba Web
Archivo: `clima-websocket-test.html`

```
http://localhost:3000/clima-websocket-test.html
```

**Características:**
- ✅ Conexión/desconexión WebSocket
- ✅ Consulta de clima en tiempo real
- ✅ Visualización de datos climáticos
- ✅ Log de eventos en tiempo real
- ✅ Indicadores de severidad
- ✅ Interfaz responsive

### 2. Cliente Node.js
Archivo: `clima-client.example.ts`

Un cliente completo para testing desde consola:

```bash
# Ejecutar cliente de prueba
ts-node src/websocket/clima-client.example.ts
```

## 🌟 Eventos Disponibles

### 📡 **Para suscribirse:**
```javascript
socket.emit('subscribe-weather');   // Suscribirse a clima
socket.emit('subscribe-dashboard'); // Dashboard general
```

### 📥 **Para escuchar:**
```javascript
socket.on('weather:updated', (data) => {
    // Nueva actualización climática
});

socket.on('weather:alert', (data) => {
    // Alerta por condiciones extremas
});

socket.on('dashboard:real-time', (data) => {
    // Actualización del dashboard
});
```

## 🔄 Comunicación Entre Módulos

El sistema también maneja comunicación entre módulos:

### 🌱 **Impacto en Cultivos:**
Cuando se detectan condiciones críticas, el sistema automáticamente:
- Evalúa el impacto en cultivos
- Genera recomendaciones de riego
- Emite eventos `weather:affects-crop`

### 📊 **Dashboard Integrado:**
Todos los eventos se replican al dashboard para:
- Monitoreo centralizado
- Visualización en tiempo real
- Análisis de tendencias

## 🛠️ Configuración

### Variables de Entorno Necesarias:
```env
OPENWEATHER_API_KEY=your_api_key_here
OPENWEATHER_BASE_URL=http://api.openweathermap.org/data/2.5/weather
```

### Puerto WebSocket:
```
ws://localhost:3000
```

## 🧪 Ejemplos de Uso

### 1. **Cliente Simple JavaScript:**
```javascript
const socket = io('http://localhost:3000');

// Conectar y suscribirse
socket.on('connect', () => {
    socket.emit('subscribe-weather');
});

// Escuchar actualizaciones
socket.on('weather:updated', (data) => {
    console.log(`Clima en ${data.ciudad}: ${data.temperatura}°C`);
});
```

### 2. **Consulta que genera eventos:**
```bash
curl -H "Authorization: Bearer your-token" \
     "http://localhost:3000/api/consulta-clima?ciudad=Bogotá"
```

### 3. **Monitoreo de severidad:**
```javascript
socket.on('weather:updated', (data) => {
    switch(data.severity) {
        case 'critical':
            alert('¡CONDICIONES CRÍTICAS!');
            break;
        case 'high':
            console.warn('Condiciones adversas');
            break;
    }
});
```

## 🚀 Próximas Mejoras

### 🔮 **Funcionalidades planeadas:**
- [ ] Predicciones climáticas
- [ ] Mapas de calor
- [ ] Alertas por ubicación geográfica
- [ ] Integración con más APIs climáticas
- [ ] Notificaciones push
- [ ] Historial de alertas
- [ ] Métricas y analytics

### 🔧 **Optimizaciones técnicas:**
- [ ] Compresión de datos WebSocket
- [ ] Reconexión automática mejorada
- [ ] Rate limiting por cliente
- [ ] Clustering para escalabilidad

## 📝 Notas Importantes

1. **Autenticación**: Las consultas al API requieren token JWT válido
2. **Rate Limiting**: Se recomienda implementar límites de consulta
3. **Error Handling**: El sistema maneja errores de API y los comunica via WebSocket
4. **Escalabilidad**: Preparado para múltiples clientes simultáneos

## 🆘 Troubleshooting

### Problema: "No se reciben eventos WebSocket"
**Solución:**
1. Verificar conexión: `socket.connected`
2. Confirmar suscripción: `socket.emit('subscribe-weather')`
3. Revisar logs del servidor

### Problema: "Error de CORS"
**Solución:**
1. Verificar configuración CORS en `app.ts`
2. Asegurar origin correcto en cliente

### Problema: "Token inválido"
**Solución:**
1. Generar token válido desde `/api/auth`
2. Incluir en header `Authorization: Bearer <token>`

---

**🎯 Estado**: ✅ **FUNCIONAL** - WebSocket integrado con consulta clima
**📅 Última actualización**: 20 de julio de 2025
**👨‍💻 Desarrollado por**: MundoVerde Team
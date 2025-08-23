import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { WebSocketEvents, WeatherEvent, CropEvent, CrossModuleEvent } from './events.types';

export class WebSocketService {
    private io: Server;
    private static instance: WebSocketService;

    constructor(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: "*", // En producción, especifica los dominios permitidos
                methods: ["GET", "POST"]
            }
        });

        this.setupEventHandlers();
        WebSocketService.instance = this;
    }

    // Singleton para acceder desde cualquier módulo
    static getInstance(): WebSocketService {
        return WebSocketService.instance;
    }

    private setupEventHandlers() {
        this.io.on('connection', (socket: any) => {
            console.log('🔌 Cliente conectado:', socket.id);

            // Suscripciones por módulo
            socket.on('subscribe-weather', () => {
                socket.join('weather-room');
                console.log('🌤️ Cliente suscrito a actualizaciones de clima');
            });

            socket.on('subscribe-crops', () => {
                socket.join('crops-room');
                console.log('🌱 Cliente suscrito a actualizaciones de cultivos');
            });

            socket.on('subscribe-dashboard', () => {
                socket.join('dashboard-room');
                console.log('📊 Cliente suscrito al dashboard general');
            });

            socket.on('disconnect', () => {
                console.log('🔌 Cliente desconectado:', socket.id);
            });
        });
    }

    // === EVENTOS DEL MÓDULO CLIMA ===
    
    // Notificar actualización de clima
    notifyWeatherUpdate(data: WeatherEvent) {
        this.io.to('weather-room').emit(WebSocketEvents.WEATHER_UPDATED, data);
        this.io.to('dashboard-room').emit(WebSocketEvents.REAL_TIME_DASHBOARD, {
            module: 'clima',
            type: 'update',
            data
        });

        // Si hay condiciones extremas, notificar al módulo de cultivos
        if (data.severity === 'critical') {
            this.notifyCrossModule({
                sourceModule: 'clima',
                targetModule: 'cultivos',
                eventType: WebSocketEvents.WEATHER_AFFECTS_CROP,
                data: {
                    weather: data,
                    recommendation: this.getWeatherRecommendation(data)
                },
                priority: 'high',
                timestamp: new Date()
            });
        }
    }

    // Alerta climática
    notifyWeatherAlert(data: WeatherEvent & { alertType: string; message: string }) {
        this.io.emit(WebSocketEvents.WEATHER_ALERT, data); // A todos los clientes
    }

    // === EVENTOS DEL MÓDULO CULTIVOS ===
    
    // Notificar estado de cultivos
    notifyCropUpdate(data: CropEvent) {
        this.io.to('crops-room').emit('crop:updated', data);
        this.io.to('dashboard-room').emit(WebSocketEvents.REAL_TIME_DASHBOARD, {
            module: 'cultivos',
            type: 'update',
            data
        });
    }

    // === COMUNICACIÓN ENTRE MÓDULOS ===
    
    // Enviar evento entre módulos
    notifyCrossModule(event: CrossModuleEvent) {
        const targetRoom = `${event.targetModule}-room`;
        this.io.to(targetRoom).emit(event.eventType, event);
        
        console.log(`🔄 Evento cruzado: ${event.sourceModule} → ${event.targetModule}`);
    }

    // Recomendaciones de riego basadas en clima
    notifyIrrigationRecommendation(weatherData: WeatherEvent, cropData: CropEvent) {
        const recommendation = {
            action: this.calculateIrrigationAction(weatherData, cropData),
            reason: `Basado en clima de ${weatherData.ciudad} y estado de ${cropData.cultivo}`,
            urgency: (weatherData.precipitacion ?? 0) > 10 ? 'low' : 'high',
            timestamp: new Date()
        };

        this.io.to('crops-room').emit(WebSocketEvents.IRRIGATION_RECOMMENDATION, recommendation);
        this.io.to('dashboard-room').emit(WebSocketEvents.REAL_TIME_DASHBOARD, {
            module: 'cross-module',
            type: 'recommendation',
            data: recommendation
        });
    }

    // === MÉTODOS AUXILIARES ===
    
    private getWeatherRecommendation(weather: WeatherEvent): string {
        if ((weather.precipitacion ?? 0) > 20) return "Suspender riego por lluvia intensa";
        if (weather.temperatura > 35) return "Aumentar frecuencia de riego";
        if (weather.humedad < 30) return "Riego adicional recomendado";
        return "Condiciones normales";
    }

    private calculateIrrigationAction(weather: WeatherEvent, crop: CropEvent): string {
        if ((weather.precipitacion ?? 0) > 10) return "no_irrigation";
        if (crop.necesidadAgua > 70) return "immediate_irrigation";
        if (weather.temperatura > 30 && crop.necesidadAgua > 50) return "schedule_irrigation";
        return "monitor";
    }
}

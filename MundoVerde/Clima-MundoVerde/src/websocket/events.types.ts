// === EVENTOS DEL SISTEMA WEBSOCKET ===
export enum WebSocketEvents {
    // Eventos de clima
    WEATHER_UPDATED = 'weather:updated',
    WEATHER_ALERT = 'weather:alert',
    WEATHER_AFFECTS_CROP = 'weather:affects-crop',
    
    // Eventos de cultivos
    CROP_UPDATED = 'crop:updated',
    CROP_ALERT = 'crop:alert',
    
    // Eventos de riego
    IRRIGATION_RECOMMENDATION = 'irrigation:recommendation',
    
    // Dashboard en tiempo real
    REAL_TIME_DASHBOARD = 'dashboard:real-time',
    
    // Conexión
    CONNECTION = 'connection',
    DISCONNECT = 'disconnect'
}

// === INTERFACES DE DATOS ===

export interface WeatherEvent {
    ciudad: string;
    latitud?: number;
    longitud?: number;
    temperatura: number;
    humedad: number;
    presion: number;
    descripcion: string;
    viento: number;
    precipitacion?: number;
    timestamp: Date;
    fuenteNombre: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface CropEvent {
    cultivo: string;
    estado: string;
    necesidadAgua: number;
    fase: string;
    timestamp: Date;
}

export interface CrossModuleEvent {
    sourceModule: string;
    targetModule: string;
    eventType: string;
    data: any;
    priority: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
}

export interface IrrigationRecommendation {
    action: 'no_irrigation' | 'immediate_irrigation' | 'schedule_irrigation' | 'monitor';
    reason: string;
    urgency: 'low' | 'medium' | 'high';
    timestamp: Date;
}

export interface DashboardEvent {
    module: string;
    type: 'update' | 'alert' | 'recommendation';
    data: any;
    timestamp?: Date;
}
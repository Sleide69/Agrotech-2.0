export interface MicroserviceEvent {
  service: string;
  eventType: string;
  data: any;
  timestamp: Date;
  id: string;
}

export interface CultivoEvent extends MicroserviceEvent {
  service: 'gestion-cultivo';
  eventType: 'cultivo.created' | 'cultivo.updated' | 'cultivo.deleted';
  data: {
    id: string;
    nombre: string;
    tipo: string;
    fechaPlantacion: Date;
    estado: string;
    ubicacion?: {
      lat: number;
      lng: number;
    };
  };
}

export interface PlagaEvent extends MicroserviceEvent {
  service: 'plaga';
  eventType: 'plaga.detected' | 'plaga.treated' | 'plaga.resolved';
  data: {
    id: string;
    tipo: string;
    severidad: 'baja' | 'media' | 'alta' | 'critica';
    cultivoId: string;
    ubicacion: {
      lat: number;
      lng: number;
    };
    descripcion: string;
    imagenes?: string[];
  };
}

export interface ClimaEvent extends MicroserviceEvent {
  service: 'clima';
  eventType: 'clima.alert' | 'clima.forecast' | 'clima.anomaly';
  data: {
    temperatura: number;
    humedad: number;
    precipitacion: number;
    viento: {
      velocidad: number;
      direccion: string;
    };
    alerta?: {
      tipo: string;
      nivel: string;
      mensaje: string;
    };
  };
}

export interface SensorEvent extends MicroserviceEvent {
  service: 'sensores';
  eventType: 'sensor.reading' | 'sensor.alert' | 'sensor.offline';
  data: {
    sensorId: string;
    tipo: string;
    valor: number;
    unidad: string;
    cultivoId?: string;
    alerta?: boolean;
    umbralSuperado?: boolean;
  };
}

export interface ExportacionEvent extends MicroserviceEvent {
  service: 'exportacion';
  eventType: 'exportacion.created' | 'exportacion.shipped' | 'exportacion.delivered';
  data: {
    id: string;
    cultivoId: string;
    destino: string;
    cantidad: number;
    fechaEstimada: Date;
    estado: string;
  };
}

export type AnyMicroserviceEvent = 
  | CultivoEvent 
  | PlagaEvent 
  | ClimaEvent 
  | SensorEvent 
  | ExportacionEvent;

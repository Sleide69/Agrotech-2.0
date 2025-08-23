import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AnyMicroserviceEvent, CultivoEvent, PlagaEvent, SensorEvent } from '../interfaces/microservice-events.interface';
import { ApiGatewayService } from './api-gateway.service';

export interface ConnectedClient {
  id: string;
  socket: Socket;
  userId?: string;
  subscriptions: string[]; // IDs de cultivos o tipos de eventos suscritos
  joinedAt: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private server: Server;
  private connectedClients = new Map<string, ConnectedClient>();

  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  setServer(server: Server): void {
    this.server = server;
  }

  /**
   * Maneja nueva conexión de cliente
   */
  async handleConnection(client: Socket): Promise<void> {
    const clientInfo: ConnectedClient = {
      id: client.id,
      socket: client,
      subscriptions: [],
      joinedAt: new Date()
    };

    this.connectedClients.set(client.id, clientInfo);
    this.logger.log(`Cliente conectado: ${client.id}. Total clientes: ${this.connectedClients.size}`);

    // Notificar al API Gateway sobre el nuevo cliente
    await this.apiGatewayService.notifyWebSocketStatus('online', this.connectedClients.size);

    // Enviar mensaje de bienvenida
    client.emit('connected', {
      message: 'Conectado al sistema de notificaciones agrícolas',
      clientId: client.id,
      timestamp: new Date()
    });
  }

  /**
   * Maneja desconexión de cliente
   */
  async handleDisconnection(client: Socket): Promise<void> {
    this.connectedClients.delete(client.id);
    this.logger.log(`Cliente desconectado: ${client.id}. Total clientes: ${this.connectedClients.size}`);

    // Notificar al API Gateway sobre el estado actualizado
    if (this.connectedClients.size === 0) {
      await this.apiGatewayService.notifyWebSocketStatus('offline', 0);
    } else {
      await this.apiGatewayService.notifyWebSocketStatus('online', this.connectedClients.size);
    }
  }

  /**
   * Suscribe un cliente a notificaciones de cultivos específicos
   */
  subscribeToCultivo(clientId: string, cultivoId: string): boolean {
    const client = this.connectedClients.get(clientId);
    if (!client) {
      this.logger.warn(`Cliente ${clientId} no encontrado para suscripción`);
      return false;
    }

    if (!client.subscriptions.includes(cultivoId)) {
      client.subscriptions.push(cultivoId);
      client.socket.join(`cultivo:${cultivoId}`);
      this.logger.log(`Cliente ${clientId} suscrito al cultivo ${cultivoId}`);
    }

    return true;
  }

  /**
   * Desuscribe un cliente de notificaciones de un cultivo
   */
  unsubscribeFromCultivo(clientId: string, cultivoId: string): boolean {
    const client = this.connectedClients.get(clientId);
    if (!client) {
      return false;
    }

    const index = client.subscriptions.indexOf(cultivoId);
    if (index > -1) {
      client.subscriptions.splice(index, 1);
      client.socket.leave(`cultivo:${cultivoId}`);
      this.logger.log(`Cliente ${clientId} desuscrito del cultivo ${cultivoId}`);
    }

    return true;
  }

  /**
   * Procesa eventos de microservicios y envía notificaciones
   */
  async processEvent(event: AnyMicroserviceEvent): Promise<void> {
    this.logger.log(`Procesando evento: ${event.service}.${event.eventType}`);

    try {
      switch (event.service) {
        case 'gestion-cultivo':
          await this.handleCultivoEvent(event as CultivoEvent);
          break;
        case 'plaga':
          await this.handlePlagaEvent(event as PlagaEvent);
          break;
        case 'sensores':
          await this.handleSensorEvent(event as SensorEvent);
          break;
        default:
          await this.handleGenericEvent(event);
      }
    } catch (error) {
      this.logger.error(`Error procesando evento ${event.eventType}:`, error.message);
    }
  }

  private async handleCultivoEvent(event: CultivoEvent): Promise<void> {
    let priority: 'low' | 'normal' | 'high' | 'critical' = 'normal';

    switch (event.eventType) {
      case 'cultivo.created':
        priority = 'high';
        // Notificar a todos los clientes sobre nuevo cultivo
        this.server.emit('cultivation:new', {
          type: 'cultivo',
          event: event.eventType,
          data: event.data,
          timestamp: event.timestamp,
          priority
        });
        this.logger.log(`Nuevo cultivo creado: ${event.data.nombre}`);
        break;

      case 'cultivo.updated':
        // Notificar solo a clientes suscritos a este cultivo
        this.server.to(`cultivo:${event.data.id}`).emit('cultivation:updated', {
          type: 'cultivo',
          event: event.eventType,
          data: event.data,
          timestamp: event.timestamp,
          priority
        });
        this.logger.log(`Cultivo actualizado: ${event.data.id}`);
        break;

      case 'cultivo.deleted':
        priority = 'high';
        this.server.to(`cultivo:${event.data.id}`).emit('cultivation:deleted', {
          type: 'cultivo',
          event: event.eventType,
          data: event.data,
          timestamp: event.timestamp,
          priority
        });
        this.logger.log(`Cultivo eliminado: ${event.data.id}`);
        break;
    }
  }

  private async handlePlagaEvent(event: PlagaEvent): Promise<void> {
    const notification = {
      type: 'plaga',
      event: event.eventType,
      data: event.data,
      timestamp: event.timestamp,
      priority: this.getPlagaPriority(event.data.severidad)
    };

    switch (event.eventType) {
      case 'plaga.detected':
        // Notificación de alta prioridad para detección de plagas
        this.server.to(`cultivo:${event.data.cultivoId}`).emit('pest:detected', notification);
        
        // Si es severidad crítica o alta, notificar a todos
        if (['critica', 'alta'].includes(event.data.severidad)) {
          this.server.emit('pest:critical', notification);
        }
        
        this.logger.warn(`Plaga detectada en cultivo ${event.data.cultivoId}: ${event.data.tipo} (${event.data.severidad})`);
        break;

      case 'plaga.treated':
        this.server.to(`cultivo:${event.data.cultivoId}`).emit('pest:treated', notification);
        this.logger.log(`Plaga tratada en cultivo ${event.data.cultivoId}`);
        break;

      case 'plaga.resolved':
        this.server.to(`cultivo:${event.data.cultivoId}`).emit('pest:resolved', notification);
        this.logger.log(`Plaga resuelta en cultivo ${event.data.cultivoId}`);
        break;
    }
  }

  private async handleSensorEvent(event: SensorEvent): Promise<void> {
    const notification = {
      type: 'sensor',
      event: event.eventType,
      data: event.data,
      timestamp: event.timestamp,
      priority: event.data.alerta ? 'high' : 'normal' as const
    };

    if (event.data.cultivoId) {
      this.server.to(`cultivo:${event.data.cultivoId}`).emit('sensor:data', notification);
    }

    // Si hay alerta, notificar globalmente
    if (event.data.alerta) {
      this.server.emit('sensor:alert', notification);
      this.logger.warn(`Alerta de sensor ${event.data.sensorId}: ${event.data.valor} ${event.data.unidad}`);
    }
  }

  private async handleGenericEvent(event: AnyMicroserviceEvent): Promise<void> {
    const notification = {
      type: event.service,
      event: event.eventType,
      data: event.data,
      timestamp: event.timestamp,
      priority: 'normal' as const
    };

    // Broadcast general para otros tipos de eventos
    this.server.emit(`${event.service}:${event.eventType.split('.')[1]}`, notification);
    this.logger.log(`Evento genérico procesado: ${event.service}.${event.eventType}`);
  }

  private getPlagaPriority(severidad: string): 'low' | 'normal' | 'high' | 'critical' {
    switch (severidad) {
      case 'critica': return 'critical';
      case 'alta': return 'high';
      case 'media': return 'normal';
      case 'baja': return 'low';
      default: return 'normal';
    }
  }

  /**
   * Envía estadísticas del sistema
   */
  sendSystemStats(): void {
    const stats = {
      connectedClients: this.connectedClients.size,
      timestamp: new Date(),
      uptime: process.uptime()
    };

    this.server.emit('system:stats', stats);
  }

  /**
   * Obtiene lista de clientes conectados
   */
  getConnectedClients(): ConnectedClient[] {
    return Array.from(this.connectedClients.values());
  }
}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { NotificationService } from '../services/notification.service';
import { ApiGatewayService } from '../services/api-gateway.service';

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:4200'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly apiGatewayService: ApiGatewayService,
  ) {}

  afterInit(server: Server): void {
    this.notificationService.setServer(server);
    this.logger.log('WebSocket Gateway inicializado');
    
    // Registrar el servicio en el API Gateway
    this.apiGatewayService.registerWebSocketService();
    
    // Suscribirse a eventos de microservicios
    this.apiGatewayService.subscribeToMicroserviceEvents();
  }

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    await this.notificationService.handleConnection(client);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    await this.notificationService.handleDisconnection(client);
  }

  @SubscribeMessage('subscribe_cultivo')
  handleSubscribeCultivo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { cultivoId: string },
  ): void {
    try {
      const success = this.notificationService.subscribeToCultivo(client.id, data.cultivoId);
      
      client.emit('subscription_result', {
        success,
        message: success 
          ? `Suscrito al cultivo ${data.cultivoId}` 
          : 'Error al suscribirse al cultivo',
        cultivoId: data.cultivoId,
        type: 'subscribe'
      });

      // Enviar información inicial del cultivo
      if (success) {
        this.sendCultivoInitialData(client, data.cultivoId);
      }
    } catch (error) {
      this.logger.error(`Error en suscripción de cultivo: ${error.message}`);
      client.emit('subscription_result', {
        success: false,
        message: 'Error interno al suscribirse',
        cultivoId: data.cultivoId,
        type: 'subscribe'
      });
    }
  }

  @SubscribeMessage('unsubscribe_cultivo')
  handleUnsubscribeCultivo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { cultivoId: string },
  ): void {
    try {
      const success = this.notificationService.unsubscribeFromCultivo(client.id, data.cultivoId);
      
      client.emit('subscription_result', {
        success,
        message: success 
          ? `Desuscrito del cultivo ${data.cultivoId}` 
          : 'Error al desuscribirse del cultivo',
        cultivoId: data.cultivoId,
        type: 'unsubscribe'
      });
    } catch (error) {
      this.logger.error(`Error en desuscripción de cultivo: ${error.message}`);
      client.emit('subscription_result', {
        success: false,
        message: 'Error interno al desuscribirse',
        cultivoId: data.cultivoId,
        type: 'unsubscribe'
      });
    }
  }

  @SubscribeMessage('get_system_stats')
  handleGetSystemStats(@ConnectedSocket() client: Socket): void {
    try {
      this.notificationService.sendSystemStats();
    } catch (error) {
      this.logger.error(`Error obteniendo estadísticas: ${error.message}`);
    }
  }

  @SubscribeMessage('get_connected_clients')
  handleGetConnectedClients(@ConnectedSocket() client: Socket): void {
    try {
      const clients = this.notificationService.getConnectedClients();
      const clientsInfo = clients.map(c => ({
        id: c.id,
        userId: c.userId,
        subscriptions: c.subscriptions,
        joinedAt: c.joinedAt
      }));

      client.emit('connected_clients', {
        clients: clientsInfo,
        total: clients.length,
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error(`Error obteniendo clientes conectados: ${error.message}`);
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong', {
      timestamp: new Date(),
      clientId: client.id
    });
  }

  private async sendCultivoInitialData(client: Socket, cultivoId: string): Promise<void> {
    try {
      // Obtener información inicial del cultivo
      const cultivoInfo = await this.apiGatewayService.getCultivoInfo(cultivoId);
      if (cultivoInfo) {
        client.emit('cultivo:initial_data', {
          cultivoId,
          data: cultivoInfo,
          timestamp: new Date()
        });
      }

      // Obtener información de sensores
      const sensoresInfo = await this.apiGatewayService.getSensoresInfo(cultivoId);
      if (sensoresInfo) {
        client.emit('sensores:initial_data', {
          cultivoId,
          sensores: sensoresInfo,
          timestamp: new Date()
        });
      }
    } catch (error) {
      this.logger.error(`Error enviando datos iniciales para cultivo ${cultivoId}: ${error.message}`);
    }
  }

  /**
   * Método público para procesar eventos desde webhooks
   */
  async processExternalEvent(event: any): Promise<void> {
    await this.notificationService.processEvent(event);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, map, retry, timeout } from 'rxjs/operators';
import { firstValueFrom, of } from 'rxjs';
import { AnyMicroserviceEvent } from '../interfaces/microservice-events.interface';

@Injectable()
export class ApiGatewayService {
  private readonly logger = new Logger(ApiGatewayService.name);
  private readonly apiGatewayUrl: string;
  private readonly timeout: number = 5000;
  private readonly retryAttempts: number = 3;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiGatewayUrl = this.configService.get<string>('API_GATEWAY_URL', 'http://localhost:3001');
  }

  /**
   * Registra el servicio WebSocket en el API Gateway
   */
  async registerWebSocketService(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiGatewayUrl}/websocket/register`, {
          serviceName: 'websocket-notifications',
          endpoint: this.configService.get<string>('WEBSOCKET_URL', 'http://localhost:3000'),
          events: [
            'cultivo.created', 'cultivo.updated', 'cultivo.deleted',
            'plaga.detected', 'plaga.treated', 'plaga.resolved',
            'clima.alert', 'clima.forecast', 'clima.anomaly',
            'sensor.reading', 'sensor.alert', 'sensor.offline',
            'exportacion.created', 'exportacion.shipped', 'exportacion.delivered'
          ]
        }).pipe(
          timeout(this.timeout),
          retry(this.retryAttempts),
          catchError((error) => {
            this.logger.error('Error registrando servicio WebSocket:', error.message);
            return of(null);
          })
        )
      );

      if (response) {
        this.logger.log('Servicio WebSocket registrado exitosamente en API Gateway');
      }
    } catch (error) {
      this.logger.error('Error al registrar servicio WebSocket:', error.message);
    }
  }

  /**
   * Suscribe a eventos de microservicios
   */
  async subscribeToMicroserviceEvents(): Promise<void> {
    try {
      const subscriptions = [
        { service: 'gestion-cultivo', events: ['cultivo.created', 'cultivo.updated', 'cultivo.deleted'] },
        { service: 'plaga', events: ['plaga.detected', 'plaga.treated', 'plaga.resolved'] },
        { service: 'clima', events: ['clima.alert', 'clima.forecast', 'clima.anomaly'] },
        { service: 'sensores', events: ['sensor.reading', 'sensor.alert', 'sensor.offline'] },
        { service: 'exportacion', events: ['exportacion.created', 'exportacion.shipped', 'exportacion.delivered'] }
      ];

      for (const subscription of subscriptions) {
        await this.subscribeToService(subscription.service, subscription.events);
      }
    } catch (error) {
      this.logger.error('Error suscribiéndose a eventos de microservicios:', error.message);
    }
  }

  private async subscribeToService(serviceName: string, events: string[]): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiGatewayUrl}/events/subscribe`, {
          subscriber: 'websocket-notifications',
          service: serviceName,
          events: events,
          webhookUrl: `${this.configService.get<string>('WEBSOCKET_URL', 'http://localhost:3000')}/webhook/events`
        }).pipe(
          timeout(this.timeout),
          retry(this.retryAttempts),
          catchError((error) => {
            this.logger.error(`Error suscribiéndose al servicio ${serviceName}:`, error.message);
            return of(null);
          })
        )
      );

      if (response) {
        this.logger.log(`Suscrito exitosamente al servicio ${serviceName}`);
      }
    } catch (error) {
      this.logger.error(`Error en suscripción a ${serviceName}:`, error.message);
    }
  }

  /**
   * Obtiene información de un cultivo específico
   */
  async getCultivoInfo(cultivoId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiGatewayUrl}/gestion-cultivo/cultivos/${cultivoId}`).pipe(
          timeout(this.timeout),
          retry(this.retryAttempts),
          map(response => response.data),
          catchError((error) => {
            this.logger.error(`Error obteniendo información del cultivo ${cultivoId}:`, error.message);
            return of(null);
          })
        )
      );

      return response;
    } catch (error) {
      this.logger.error(`Error al obtener cultivo ${cultivoId}:`, error.message);
      return null;
    }
  }

  /**
   * Obtiene información de sensores de un cultivo
   */
  async getSensoresInfo(cultivoId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiGatewayUrl}/sensores/cultivo/${cultivoId}`).pipe(
          timeout(this.timeout),
          retry(this.retryAttempts),
          map(response => response.data),
          catchError((error) => {
            this.logger.error(`Error obteniendo sensores del cultivo ${cultivoId}:`, error.message);
            return of(null);
          })
        )
      );

      return response;
    } catch (error) {
      this.logger.error(`Error al obtener sensores del cultivo ${cultivoId}:`, error.message);
      return null;
    }
  }

  /**
   * Notifica al API Gateway sobre el estado del WebSocket
   */
  async notifyWebSocketStatus(status: 'online' | 'offline', connectedClients: number): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.apiGatewayUrl}/websocket/status`, {
          service: 'websocket-notifications',
          status,
          connectedClients,
          timestamp: new Date()
        }).pipe(
          timeout(this.timeout),
          catchError((error) => {
            this.logger.warn('Error notificando estado del WebSocket:', error.message);
            return of(null);
          })
        )
      );
    } catch (error) {
      this.logger.warn('Error al notificar estado del WebSocket:', error.message);
    }
  }
}

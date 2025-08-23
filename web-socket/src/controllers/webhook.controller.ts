import { Controller, Post, Body, Logger, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { NotificationGateway } from '../gateways/notification.gateway';
import { AnyMicroserviceEvent } from '../interfaces/microservice-events.interface';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly notificationGateway: NotificationGateway) {}

  @Post('events')
  @HttpCode(HttpStatus.OK)
  async receiveEvent(
    @Body() event: AnyMicroserviceEvent,
    @Headers('x-api-gateway-signature') signature?: string,
  ): Promise<{ status: string; timestamp: Date }> {
    try {
      this.logger.log(`Webhook recibido: ${event.service}.${event.eventType}`);
      
      // Aquí podrías agregar validación de firma para seguridad
      if (signature) {
        const isValid = this.validateSignature(event, signature);
        if (!isValid) {
          this.logger.warn('Firma de webhook inválida');
          return {
            status: 'error',
            timestamp: new Date()
          };
        }
      }

      // Procesar el evento
      await this.notificationGateway.processExternalEvent(event);

      return {
        status: 'success',
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error(`Error procesando webhook: ${error.message}`);
      return {
        status: 'error',
        timestamp: new Date()
      };
    }
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async testWebhook(@Body() data: any): Promise<{ message: string; received: any; timestamp: Date }> {
    this.logger.log('Webhook de prueba recibido:', JSON.stringify(data, null, 2));
    
    return {
      message: 'Webhook de prueba recibido correctamente',
      received: data,
      timestamp: new Date()
    };
  }

  private validateSignature(event: AnyMicroserviceEvent, signature: string): boolean {
    // Implementar validación de firma HMAC SHA-256
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.WEBHOOK_SECRET || 'your-secret-key')
    //   .update(JSON.stringify(event))
    //   .digest('hex');
    
    // return signature === expectedSignature;
    
    // Por ahora, solo validamos que existe
    return !!signature;
  }
}

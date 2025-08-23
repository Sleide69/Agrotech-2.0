/**
 * Ejemplo de cliente WebSocket para el módulo de clima
 * Este archivo muestra cómo conectarse y escuchar eventos del WebSocket de clima
 */

import io from 'socket.io-client';
import { WeatherEvent } from './events.types';

class ClimaWebSocketClient {
    private socket: any; // Usando any para evitar problemas de tipos con socket.io-client
    private isConnected: boolean = false;

    constructor(serverUrl: string = 'http://localhost:3000') {
        this.socket = io(serverUrl);
        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        // Conexión establecida
        this.socket.on('connect', () => {
            console.log('🟢 Conectado al servidor WebSocket');
            this.isConnected = true;
            
            // Suscribirse automáticamente a actualizaciones de clima
            this.subscribeToWeather();
            this.subscribeToDashboard();
        });

        // Desconexión
        this.socket.on('disconnect', (reason: string) => {
            console.log('🔴 Desconectado del servidor:', reason);
            this.isConnected = false;
        });

        // Errores de conexión
        this.socket.on('connect_error', (error: Error) => {
            console.error('❌ Error de conexión:', error.message);
        });

        // === EVENTOS DE CLIMA ===

        // Actualización de datos climáticos
        this.socket.on('weather:updated', (data: WeatherEvent) => {
            this.onWeatherUpdate(data);
        });

        // Alertas climáticas
        this.socket.on('weather:alert', (data: WeatherEvent & { alertType: string; message: string }) => {
            this.onWeatherAlert(data);
        });

        // Eventos que afectan cultivos
        this.socket.on('weather:affects-crop', (data: any) => {
            this.onWeatherAffectsCrop(data);
        });

        // Eventos del dashboard en tiempo real
        this.socket.on('dashboard:real-time', (data: any) => {
            if (data.module === 'clima') {
                this.onDashboardUpdate(data);
            }
        });
    }

    // === SUSCRIPCIONES ===

    public subscribeToWeather() {
        if (this.isConnected) {
            this.socket.emit('subscribe-weather');
            console.log('📡 Suscrito a actualizaciones de clima');
        }
    }

    public subscribeToDashboard() {
        if (this.isConnected) {
            this.socket.emit('subscribe-dashboard');
            console.log('📊 Suscrito al dashboard general');
        }
    }

    // === MANEJADORES DE EVENTOS ===

    private onWeatherUpdate(data: WeatherEvent) {
        console.log('\n🌤️ === ACTUALIZACIÓN CLIMÁTICA ===');
        console.log(`📍 Ciudad: ${data.ciudad}`);
        console.log(`🌡️ Temperatura: ${data.temperatura}°C`);
        console.log(`💧 Humedad: ${data.humedad}%`);
        console.log(`🏔️ Presión: ${data.presion} hPa`);
        console.log(`💨 Viento: ${data.viento} m/s`);
        console.log(`☁️ Descripción: ${data.descripcion}`);
        console.log(`⚠️ Severidad: ${data.severity}`);
        console.log(`📅 Timestamp: ${new Date(data.timestamp).toLocaleString()}`);
        console.log(`🔌 Fuente: ${data.fuenteNombre}`);
        
        // Procesar datos según la severidad
        this.processWeatherBySeverity(data);
    }

    private onWeatherAlert(data: WeatherEvent & { alertType: string; message: string }) {
        console.log('\n⚠️ === ALERTA CLIMÁTICA ===');
        console.log(`🚨 Tipo: ${data.alertType}`);
        console.log(`📢 Mensaje: ${data.message}`);
        console.log(`📍 Ciudad: ${data.ciudad}`);
        console.log(`⚠️ Severidad: ${data.severity}`);
        console.log(`📅 Timestamp: ${new Date(data.timestamp).toLocaleString()}`);
    }

    private onWeatherAffectsCrop(data: any) {
        console.log('\n🌱 === IMPACTO EN CULTIVOS ===');
        console.log(`📍 Ciudad: ${data.data.weather.ciudad}`);
        console.log(`🌾 Recomendación: ${data.data.recommendation}`);
        console.log(`⚠️ Prioridad: ${data.priority}`);
        console.log(`📅 Timestamp: ${new Date(data.timestamp).toLocaleString()}`);
    }

    private onDashboardUpdate(data: any) {
        console.log('\n📊 === ACTUALIZACIÓN DASHBOARD ===');
        console.log(`📦 Módulo: ${data.module}`);
        console.log(`🔄 Tipo: ${data.type}`);
        console.log(`📍 Ciudad: ${data.data.ciudad || 'N/A'}`);
    }

    // === PROCESAMIENTO POR SEVERIDAD ===

    private processWeatherBySeverity(data: WeatherEvent) {
        switch (data.severity) {
            case 'critical':
                console.log('🚨 CRÍTICO: Se requiere atención inmediata');
                this.handleCriticalWeather(data);
                break;
            case 'high':
                console.log('⚠️ ALTO: Condiciones adversas detectadas');
                this.handleHighRiskWeather(data);
                break;
            case 'medium':
                console.log('🟡 MEDIO: Condiciones a monitorear');
                this.handleMediumRiskWeather(data);
                break;
            case 'low':
                console.log('🟢 BAJO: Condiciones normales');
                this.handleNormalWeather(data);
                break;
        }
    }

    private handleCriticalWeather(data: WeatherEvent) {
        // Lógica para condiciones críticas
        console.log('   → Activando protocolos de emergencia');
        if (data.temperatura > 40) {
            console.log('   → Recomendación: Protección contra calor extremo');
        }
        if (data.viento > 25) {
            console.log('   → Recomendación: Protección contra vientos fuertes');
        }
    }

    private handleHighRiskWeather(data: WeatherEvent) {
        // Lógica para condiciones de alto riesgo
        console.log('   → Implementando medidas preventivas');
        if (data.humedad > 80) {
            console.log('   → Recomendación: Monitorear hongos y enfermedades');
        }
    }

    private handleMediumRiskWeather(data: WeatherEvent) {
        // Lógica para condiciones moderadas
        console.log('   → Monitoreo regular recomendado');
    }

    private handleNormalWeather(data: WeatherEvent) {
        // Lógica para condiciones normales
        console.log('   → Continuando operaciones normales');
    }

    // === MÉTODOS PÚBLICOS ===

    public getConnectionStatus(): boolean {
        return this.isConnected;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    // Método para simular una consulta de clima (útil para pruebas)
    public async simulateWeatherQuery(ciudad: string, token: string = 'demo-token') {
        try {
            console.log(`\n🔍 Simulando consulta para: ${ciudad}`);
            
            const response = await fetch(`http://localhost:3000/api/consulta-clima?ciudad=${encodeURIComponent(ciudad)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Consulta API exitosa - esperando eventos WebSocket...');
                return data;
            } else {
                const error = await response.json();
                console.error('❌ Error en consulta API:', error);
                return null;
            }
        } catch (error) {
            console.error('❌ Error de red:', error);
            return null;
        }
    }
}

// === EJEMPLO DE USO ===

if (require.main === module) {
    console.log('🌟 === INICIANDO CLIENTE WEBSOCKET CLIMA ===');
    console.log('📋 Este cliente se conecta automáticamente y escucha eventos');
    console.log('🔌 Conectando al servidor...\n');

    const cliente = new ClimaWebSocketClient();

    // Simular algunas consultas después de conectar
    setTimeout(async () => {
        if (cliente.getConnectionStatus()) {
            console.log('\n🧪 === INICIANDO PRUEBAS AUTOMÁTICAS ===');
            
            // Probar diferentes ciudades
            const ciudades = ['Bogotá', 'Medellín', 'Cali', 'Madrid', 'Phoenix']; // Phoenix debería dar alerta de calor
            
            for (let i = 0; i < ciudades.length; i++) {
                setTimeout(() => {
                    cliente.simulateWeatherQuery(ciudades[i]);
                }, i * 3000); // Esperar 3 segundos entre consultas
            }
        }
    }, 2000);

    // Mantener el proceso vivo
    process.on('SIGINT', () => {
        console.log('\n\n👋 Desconectando cliente...');
        cliente.disconnect();
        process.exit(0);
    });

    console.log('💡 Presiona Ctrl+C para terminar el cliente');
}

export { ClimaWebSocketClient };

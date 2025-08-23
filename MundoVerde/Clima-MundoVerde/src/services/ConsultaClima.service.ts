import { AppDataSource } from '../config/data-source';
import { ConsultaClima } from '../entities/ConsultaClimaEntity';
import { FuenteClimatica } from '../entities/FuenteClimaticaEntity';
import { Clima } from '../entities/ClimaEntity';
import { ErrorConsulta } from '../entities/ErrorConsultaEntity';
import { LogSistema } from '../entities/LogSistemaEntity';
import { WebSocketService } from '../websocket/websocket.service';
import { WeatherEvent } from '../websocket/events.types';

import axios from 'axios';

interface ClimaAPIResponse {
    main: {
        temp: number;
        humidity: number;
        pressure: number;
    };
    weather: { description: string }[];
    wind: { speed: number };
    coord: { lat: number; lon: number };
}

export class ConsultaClimaService {
    private consultaRepo = AppDataSource.getRepository(ConsultaClima);
    private fuenteRepo = AppDataSource.getRepository(FuenteClimatica);
    private climaRepo = AppDataSource.getRepository(Clima);
    private errorRepo = AppDataSource.getRepository(ErrorConsulta);
    private logRepo = AppDataSource.getRepository(LogSistema);

    // Usaremos OpenWeather como ejemplo. Puedes parametrizar después
    private apiKey = process.env.OPENWEATHER_API_KEY;
    private baseUrl = process.env.OPENWEATHER_BASE_URL!;


    async consultarPorCiudad(ciudad: string) {
        // 1. Verificar si la fuente ya existe
        let fuente = await this.fuenteRepo.findOneBy({ nombre: 'OpenWeather' });
        if (!fuente) {
            fuente = this.fuenteRepo.create({
                nombre: 'OpenWeather',
                urlBase: this.baseUrl,
            });
            await this.fuenteRepo.save(fuente);
        }

        // 2. Crear registro de consulta preliminar
        const consulta = this.consultaRepo.create({
            fuente: { id: fuente.id },
            ciudad,
            latitud: 0,
            longitud: 0,
            fechaConsulta: new Date(),
            exito: false, // temporal
        });
        await this.consultaRepo.save(consulta);

        try {
            // 3. Hacer GET a la API externa
            const response = await axios.get<ClimaAPIResponse>(this.baseUrl, {
                params: {
                    q: ciudad,
                    appid: this.apiKey,
                    units: 'metric',
                    lang: 'es',
                },
            });

            // 4. Guardar datos de Clima
            const data = response.data;
            consulta.latitud = data.coord.lat;
            consulta.longitud = data.coord.lon;
            consulta.exito = true;
            await this.consultaRepo.save(consulta);

            const clima = this.climaRepo.create({
                consulta: { id: consulta.id },
                temperatura: data.main.temp,
                humedad: data.main.humidity,
                presion: data.main.pressure,
                descripcion: data.weather[0].description,
                viento: data.wind.speed,
            });
            await this.climaRepo.save(clima);

            // 5. Guardar log sistema
            const log = this.logRepo.create({
                consulta: { id: consulta.id },
                fuenteNombre: fuente.nombre,
                ciudad,
                resultadoConsulta: 'éxito',
                mensaje: `${clima.temperatura}°C, humedad ${clima.humedad}%`,
                fechaHora: new Date(),
            });
            await this.logRepo.save(log);

            // 6. Emitir evento WebSocket si hay una instancia disponible
            const wsService = WebSocketService.getInstance();
            if (wsService) {
                const weatherEvent: WeatherEvent = {
                    ciudad,
                    latitud: consulta.latitud,
                    longitud: consulta.longitud,
                    temperatura: clima.temperatura,
                    humedad: clima.humedad,
                    presion: clima.presion,
                    descripcion: clima.descripcion,
                    viento: clima.viento,
                    precipitacion: 0, // Puedes agregar esto a la API si está disponible
                    timestamp: new Date(),
                    fuenteNombre: fuente.nombre,
                    severity: this.calculateWeatherSeverity(clima.temperatura, clima.humedad, clima.viento)
                };

                wsService.notifyWeatherUpdate(weatherEvent);

                // Si hay condiciones críticas, enviar alerta
                if (weatherEvent.severity === 'critical') {
                    wsService.notifyWeatherAlert({
                        ...weatherEvent,
                        alertType: 'extreme_weather',
                        message: this.generateAlertMessage(weatherEvent)
                    });
                }
            }

            // 7. Preparar respuesta
            return {
                ciudad,
                latitud: consulta.latitud,
                longitud: consulta.longitud,
                fechaConsulta: consulta.fechaConsulta,
                exito: consulta.exito,
                fuenteNombre: fuente.nombre,
                clima,
            };

        } catch (error: any) {
            // 7. Guardar error consulta
            const codigoError = error.response?.status?.toString() || 'Error';
            const mensaje = error.response?.data?.message || error.message;

            const errorConsulta = this.errorRepo.create({
                consulta: { id: consulta.id },
                codigoError,
                mensaje,
                fechaError: new Date(),
            });
            await this.errorRepo.save(errorConsulta);

            // Actualizar consulta
            consulta.exito = false;
            await this.consultaRepo.save(consulta);

            // Guardar log sistema
            const log = this.logRepo.create({
                consulta: { id: consulta.id },
                fuenteNombre: fuente.nombre,
                ciudad,
                resultadoConsulta: 'error',
                mensaje,
                fechaHora: new Date(),
            });
            await this.logRepo.save(log);

            // Emitir evento WebSocket de error si hay una instancia disponible
            const wsService = WebSocketService.getInstance();
            if (wsService) {
                const errorEvent: WeatherEvent = {
                    ciudad,
                    latitud: 0,
                    longitud: 0,
                    temperatura: 0,
                    humedad: 0,
                    presion: 0,
                    descripcion: 'Error en consulta',
                    viento: 0,
                    precipitacion: 0,
                    timestamp: new Date(),
                    fuenteNombre: fuente.nombre,
                    severity: 'medium'
                };

                wsService.notifyWeatherAlert({
                    ...errorEvent,
                    alertType: 'api_error',
                    message: `Error al consultar clima de ${ciudad}: ${mensaje}`
                });
            }

            return {
                ciudad,
                fechaConsulta: consulta.fechaConsulta,
                exito: false,
                fuenteNombre: fuente.nombre,
                error: {
                    codigoError,
                    mensaje,
                    fechaError: new Date(),
                },
            };
        }
    }

    // === MÉTODOS AUXILIARES PARA WEBSOCKET ===
    
    /**
     * Calcula la severidad del clima basado en temperatura, humedad y viento
     */
    private calculateWeatherSeverity(temperatura: number, humedad: number, viento: number): 'low' | 'medium' | 'high' | 'critical' {
        let severityScore = 0;

        // Evaluar temperatura
        if (temperatura > 40 || temperatura < -10) severityScore += 3; // Crítico
        else if (temperatura > 35 || temperatura < 0) severityScore += 2; // Alto
        else if (temperatura > 30 || temperatura < 5) severityScore += 1; // Medio

        // Evaluar humedad
        if (humedad > 90 || humedad < 10) severityScore += 2; // Alto
        else if (humedad > 80 || humedad < 20) severityScore += 1; // Medio

        // Evaluar viento
        if (viento > 25) severityScore += 3; // Crítico (vientos fuertes)
        else if (viento > 15) severityScore += 2; // Alto
        else if (viento > 10) severityScore += 1; // Medio

        // Determinar severidad final
        if (severityScore >= 5) return 'critical';
        if (severityScore >= 3) return 'high';
        if (severityScore >= 1) return 'medium';
        return 'low';
    }

    /**
     * Genera un mensaje de alerta basado en las condiciones climáticas
     */
    private generateAlertMessage(weather: WeatherEvent): string {
        const alerts = [];

        if (weather.temperatura > 40) {
            alerts.push('Temperatura extremadamente alta');
        } else if (weather.temperatura < -10) {
            alerts.push('Temperatura extremadamente baja');
        }

        if (weather.humedad > 90) {
            alerts.push('Humedad muy alta');
        } else if (weather.humedad < 10) {
            alerts.push('Humedad muy baja');
        }

        if (weather.viento > 25) {
            alerts.push('Vientos muy fuertes');
        }

        return alerts.length > 0 
            ? `⚠️ Condiciones críticas en ${weather.ciudad}: ${alerts.join(', ')}`
            : `⚠️ Condiciones adversas detectadas en ${weather.ciudad}`;
    }
}

using ExportModule.Data.Context;
using ExportModule.Models;
using ExportModule.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using System.Net.Http.Headers;

namespace ExportModule.Services.Implementaciones
{
    // DTO para deserializar la respuesta de la API
    public class CultivoApiDto
    {
        public int id { get; set; }
        public string nombre { get; set; } = string.Empty;
        public string tipoPlanta { get; set; } = string.Empty;
        public string zona { get; set; } = string.Empty;
        public string fechaSiembra { get; set; } = string.Empty;
    }

    public class ConsultaApiService : IConsultaApiService
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ConsultaApiService(AppDbContext context, HttpClient httpClient, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpClient = httpClient;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<int> EjecutarConsultaAsync()
        {
            // Consulta real a la API externa
            var endpoint = "http://localhost:4000/cultivo/api/cultivos";
            var consulta = new ConsultaAPI
            {
                Fecha = DateTime.UtcNow,
                Endpoint = endpoint
            };

            try
            {
                // Obtener el token de autenticación del contexto HTTP actual
                var authorizationHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault();
                string? token = null;
                
                if (!string.IsNullOrEmpty(authorizationHeader) && authorizationHeader.StartsWith("Bearer "))
                {
                    token = authorizationHeader.Substring("Bearer ".Length).Trim();
                    Console.WriteLine($"🔐 Token obtenido: {token.Substring(0, Math.Min(20, token.Length))}...");
                }
                else
                {
                    Console.WriteLine($"⚠ No se encontró token de autenticación en la petición");
                }

                // Realizar la consulta HTTP a localhost:4000/cultivo/api/cultivos
                Console.WriteLine($"Realizando consulta a: {endpoint}");
                
                // Configurar las cabeceras de autenticación si tenemos token
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    Console.WriteLine($"✅ Token agregado a las cabeceras de la petición");
                }
                
                var response = await _httpClient.GetAsync(endpoint);
                
                if (response.IsSuccessStatusCode)
                {
                    var jsonContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"✅ Consulta exitosa a {endpoint}");
                    Console.WriteLine($"📄 Respuesta recibida: {jsonContent}");
                    
                    try
                    {
                        // Deserializar la respuesta JSON con el DTO específico
                        var cultivosFromApi = JsonSerializer.Deserialize<List<CultivoApiDto>>(jsonContent);
                        Console.WriteLine($"📊 Se obtuvieron {cultivosFromApi?.Count ?? 0} cultivos de la API");
                        
                        // Convertir los datos de la API a entidades Cultivo compatibles
                        var cultivosReales = new List<Cultivo>();
                        if (cultivosFromApi != null)
                        {
                            foreach (var apiCultivo in cultivosFromApi)
                            {
                                var cultivo = new Cultivo
                                {
                                    Nombre = apiCultivo.nombre ?? "Sin nombre",
                                    Tipo = apiCultivo.tipoPlanta ?? "Sin tipo"
                                };
                                cultivosReales.Add(cultivo);
                                Console.WriteLine($"✅ Cultivo procesado: {cultivo.Nombre} - {cultivo.Tipo}");
                            }
                        }
                        
                        // Usar los cultivos reales en lugar de los simulados
                        if (cultivosReales.Any())
                        {
                            // Generar plagas simuladas para los cultivos reales
                            var plagasReales = new List<Plaga>();
                            foreach (var cultivo in cultivosReales)
                            {
                                plagasReales.Add(new Plaga { 
                                    Nombre = "Plaga común", 
                                    Nivel = "leve", 
                                    Cultivo = cultivo, 
                                    ConsultaAPI = consulta 
                                });
                            }
                            
                            consulta.Plagas = plagasReales;
                            consulta.DatosAExportar = new List<DatosAExportar>();
                            
                            // Guardar los cultivos reales
                            _context.ConsultaAPIs.Add(consulta);
                            _context.Cultivos.AddRange(cultivosReales);
                            _context.Plagas.AddRange(plagasReales);
                            
                            await _context.SaveChangesAsync();
                            Console.WriteLine($"💾 Guardados {cultivosReales.Count} cultivos reales en la base de datos");
                            
                            return consulta.Id;
                        }
                    }
                    catch (JsonException jsonEx)
                    {
                        Console.WriteLine($"❌ Error al deserializar JSON: {jsonEx.Message}");
                        Console.WriteLine($"⚠ Usando datos simulados como respaldo");
                    }
                }
                else
                {
                    Console.WriteLine($"❌ Error en la consulta HTTP: {response.StatusCode} - {response.ReasonPhrase}");
                    
                    // Leer el contenido del error para más detalles
                    var errorContent = await response.Content.ReadAsStringAsync();
                    if (!string.IsNullOrEmpty(errorContent))
                    {
                        Console.WriteLine($"📄 Detalle del error: {errorContent}");
                    }
                    Console.WriteLine($"⚠ Usando datos simulados como respaldo");
                }

                // Limpiar las cabeceras después de la petición
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"🔌 Error de conexión: {ex.Message}");
                Console.WriteLine($"💡 Asegúrate de que el servidor esté ejecutándose en localhost:4000 y que el endpoint /cultivo/api/cultivos esté disponible");
                Console.WriteLine($"⚠ Usando datos simulados como respaldo");
            }
            catch (TaskCanceledException ex)
            {
                Console.WriteLine($"⏱ Timeout en la consulta: {ex.Message}");
                Console.WriteLine($"⚠ Usando datos simulados como respaldo");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error inesperado: {ex.Message}");
                Console.WriteLine($"⚠ Usando datos simulados como respaldo");
            }

            // Datos simulados como respaldo (solo si no se pudieron obtener datos reales)
            Console.WriteLine($"📦 Usando datos simulados como respaldo");
            var cultivo1 = new Cultivo { Nombre = "Maíz", Tipo = "Cereal" };
            var cultivo2 = new Cultivo { Nombre = "Papa", Tipo = "Tubérculo" };

            // Simulamos plagas
            var plagas = new List<Plaga>
            {
                new Plaga { Nombre = "Gusano cogollero", Nivel = "moderado", Cultivo = cultivo1, ConsultaAPI = consulta },
                new Plaga { Nombre = "Pulgón", Nivel = "leve", Cultivo = cultivo1, ConsultaAPI = consulta },
                new Plaga { Nombre = "Escarabajo de la papa", Nivel = "crítico", Cultivo = cultivo2, ConsultaAPI = consulta }
            };

            consulta.Plagas = plagas;
            consulta.DatosAExportar = new List<DatosAExportar>(); // por ahora vacío

            // Agregamos entidades relacionadas
            _context.ConsultaAPIs.Add(consulta);
            _context.Cultivos.AddRange(cultivo1, cultivo2);
            _context.Plagas.AddRange(plagas);

            await _context.SaveChangesAsync();
            Console.WriteLine($"💾 Guardados datos simulados en la base de datos");

            return consulta.Id;
        }
    }
}
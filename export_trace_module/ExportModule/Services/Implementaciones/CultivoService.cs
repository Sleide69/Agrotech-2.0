using ExportModule.Data.Context;
using ExportModule.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace ExportModule.Services.Implementaciones
{
    public class CultivoService : ICultivoService
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly string _iaUrl;
        private readonly IDatosAExportarService _datosExportService;

        public CultivoService(
            AppDbContext context,
            HttpClient httpClient,
            IConfiguration config,
            IDatosAExportarService datosExportService)
        {
            _context = context;
            _httpClient = httpClient;
            _iaUrl = config["IA:EndpointEvaluacion"];
            _datosExportService = datosExportService;
        }

        public async Task<(bool esExportable, string motivo)> EvaluarCultivoAsync(int cultivoId)
        {
            var cultivo = await _context.Cultivos
                .Include(c => c.Plagas)
                .FirstOrDefaultAsync(c => c.Id == cultivoId);

            if (cultivo == null)
                return (false, "Cultivo no encontrado");

            var payload = new
            {
                cultivo = new { id = cultivo.Id, nombre = cultivo.Nombre, tipo = cultivo.Tipo },
                plagas = cultivo.Plagas.Select(p => new
                {
                    id = p.Id,
                    nombre = p.Nombre,
                    nivel = p.Nivel.ToString().ToLower()
                })
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.PostAsync(_iaUrl, content);
                response.EnsureSuccessStatusCode();

                var resultString = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<EvaluacionResultado>(resultString,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                await _datosExportService.RegistrarExportacionAsync(
                    cultivo.Id,
                    "EvaluaciónIA",
                    "json",
                    JsonSerializer.Serialize(new
                    {
                        Apto = result.AptoParaExportacion,
                        Motivo = result.Motivo
                    })
                );

                return (result.AptoParaExportacion, result.Motivo);
            }
            catch (Exception ex)
            {
                return (false, $"Error en la evaluación externa: {ex.Message}");
            }
        }

        private class EvaluacionResultado
        {
            public bool AptoParaExportacion { get; set; }
            public string Motivo { get; set; } = "";
        }
    }
}

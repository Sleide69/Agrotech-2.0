using ExportModule.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExportModule.Controllers
{

    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EvaluacionController : ControllerBase
    {
        private readonly ICultivoService _cultivoService;
        private readonly IDatosAExportarService _datosExportService;

        public EvaluacionController(
            ICultivoService cultivoService,
            IDatosAExportarService datosExportService)
        {
            _cultivoService = cultivoService;
            _datosExportService = datosExportService;
        }

        [HttpPost("evaluar/{cultivoId}")]
        public async Task<IActionResult> EvaluarCultivo(int cultivoId)
        {
            var (esExportable, motivo) = await _cultivoService.EvaluarCultivoAsync(cultivoId);

            int? exportacionId = null;

            if (esExportable)
            {
                // Para este ejemplo, usamos datos estáticos para tipo/formato/contenido
                exportacionId = await _datosExportService.RegistrarExportacionAsync(
                    cultivoId,
                    tipoDato: "Evaluacion",
                    formato: "JSON",
                    contenido: $"{{\"cultivoId\": {cultivoId}, \"resultado\": \"apto\"}}"
                );
            }

            return Ok(new
            {
                apto_para_exportacion = esExportable,
                motivo,
                exportacion_registrada = esExportable,
                id_datos_exportacion = exportacionId
            });
        }
    }
}

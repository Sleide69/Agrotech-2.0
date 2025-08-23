using ExportModule.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExportModule.Controllers
{

    [Authorize]
    [ApiController]
    [Route("api/consulta")]
    public class ConsultaApiController : ControllerBase
    {
        private readonly IConsultaApiService _consultaApiService;

        public ConsultaApiController(IConsultaApiService consultaApiService)
        {
            _consultaApiService = consultaApiService;
        }

        [HttpPost("ejecutar")]
        public async Task<IActionResult> Ejecutar()
        {
            var id = await _consultaApiService.EjecutarConsultaAsync();
            return Ok(new { id_consulta = id });
        }
    }
}

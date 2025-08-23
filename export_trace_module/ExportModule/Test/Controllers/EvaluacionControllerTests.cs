using ExportModule.Controllers;
using ExportModule.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Threading.Tasks;
using Xunit;

namespace ExportModule.Test.Controllers
{
    public class EvaluacionControllerTests
    {
        [Fact]
        public async Task EvaluarCultivo_Exportable_ReturnsOkWithExportId()
        {
            // Arrange
            var cultivoId = 1;
            var mockCultivoService = new Mock<ICultivoService>();
            var mockDatosExportService = new Mock<IDatosAExportarService>();

            // Configura el mock para devolver que es exportable
            mockCultivoService
                .Setup(s => s.EvaluarCultivoAsync(cultivoId))
                .ReturnsAsync((true, "Todo ok"));

            mockDatosExportService
                .Setup(s => s.RegistrarExportacionAsync(
                    cultivoId,
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>()))
                .ReturnsAsync(42); // ID simulado

            var controller = new EvaluacionController(
                mockCultivoService.Object,
                mockDatosExportService.Object);

            // Act
            var result = await controller.EvaluarCultivo(cultivoId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            dynamic value = okResult.Value!;

            Assert.True((bool)value.apto_para_exportacion);
            Assert.Equal("Todo ok", (string)value.motivo);
            Assert.True((bool)value.exportacion_registrada);
            Assert.Equal(42, (int)value.id_datos_exportacion);
        }

        [Fact]
        public async Task EvaluarCultivo_NotExportable_ReturnsOkWithoutExportId()
        {
            // Arrange
            var cultivoId = 2;
            var mockCultivoService = new Mock<ICultivoService>();
            var mockDatosExportService = new Mock<IDatosAExportarService>();

            // Configura el mock para devolver que NO es exportable
            mockCultivoService
                .Setup(s => s.EvaluarCultivoAsync(cultivoId))
                .ReturnsAsync((false, "No cumple requisitos"));

            var controller = new EvaluacionController(
                mockCultivoService.Object,
                mockDatosExportService.Object);

            // Act
            var result = await controller.EvaluarCultivo(cultivoId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            dynamic value = okResult.Value!;

            Assert.False((bool)value.apto_para_exportacion);
            Assert.Equal("No cumple requisitos", (string)value.motivo);
            Assert.False((bool)value.exportacion_registrada);
            Assert.Null((int?)value.id_datos_exportacion);
        }
    }
}
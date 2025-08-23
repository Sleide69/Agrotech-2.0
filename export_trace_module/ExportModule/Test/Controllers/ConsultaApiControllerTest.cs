using Xunit;
using Moq;
using ExportModule.Controllers;
using ExportModule.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace ExportModule.Test.Controllers;

public class ConsultaApiControllerTests
{
    [Fact]
    public async Task Ejecutar_ReturnsOkWithConsultaId()
    {
        // Arrange
        var mockService = new Mock<IConsultaApiService>();
        mockService.Setup(s => s.EjecutarConsultaAsync()).ReturnsAsync(123);

        var controller = new ConsultaApiController(mockService.Object);

        // Act
        var result = await controller.Ejecutar();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        dynamic value = okResult.Value!;
        Assert.Equal(123, (int)value.id_consulta);
        mockService.Verify(s => s.EjecutarConsultaAsync(), Times.Once);
    }
}
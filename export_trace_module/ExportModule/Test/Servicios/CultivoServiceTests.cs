using Xunit;
using Moq;
using ExportModule.Services.Implementaciones;
using ExportModule.Data.Context;
using ExportModule.Models;
using Microsoft.EntityFrameworkCore;
using System.Net;
using ExportModule.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using System.Net.Http;
using System.Text;

namespace ExportModule.Test.Servicios;

public class CultivoServiceTests
{
    [Fact]
    public async Task EvaluarCultivoAsync_ReturnsTrue_WhenNoPlagas()
    {
        // Arrange: usamos una BD en memoria para test aislado
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDb_NoPlagas")
            .Options;

        using var context = new AppDbContext(options);
        var cultivo = new Cultivo { Id = 1, Nombre = "Maíz", Tipo = "Grano" };
        context.Cultivos.Add(cultivo);
        context.SaveChanges();

        var mockHttpClient = new HttpClient(new FakeHttpHandler());
        var configValues = new Dictionary<string, string?>
        {
            ["IA:EndpointEvaluacion"] = "http://localhost:8000/evaluar-cultivo"
        };
        var mockConfig = new ConfigurationBuilder()
            .AddInMemoryCollection(configValues)
            .Build();

        var mockExportService = new Mock<IDatosAExportarService>();

        var service = new CultivoService(context, mockHttpClient, mockConfig, mockExportService.Object);

        // Act
        var resultado = await service.EvaluarCultivoAsync(1);

        // Assert
        Assert.True(resultado.esExportable);
        Assert.Equal("Sin plagas", resultado.motivo);

        // Verifica que se registre exportación con los datos correctos
        mockExportService.Verify(m => m.RegistrarExportacionAsync(
            1,
            "EvaluaciónIA",
            "json",
            It.Is<string>(s => s.Contains("\"Apto\":true") && s.Contains("\"Motivo\":\"Sin plagas\""))
        ), Times.Once);
    }

    [Fact]
    public async Task EvaluarCultivoAsync_ReturnsFalse_WhenCultivoNotFound()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDb_NotFound")
            .Options;

        using var context = new AppDbContext(options);

        var mockHttpClient = new HttpClient(new FakeHttpHandler());
        var mockConfig = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["IA:EndpointEvaluacion"] = "http://localhost:8000/evaluar-cultivo"
            })
            .Build();
        var mockExportService = new Mock<IDatosAExportarService>();

        var service = new CultivoService(context, mockHttpClient, mockConfig, mockExportService.Object);

        var resultado = await service.EvaluarCultivoAsync(99);

        Assert.False(resultado.esExportable);
        Assert.Equal("Cultivo no encontrado", resultado.motivo);

        // No debe intentar registrar exportación
        mockExportService.Verify(m => m.RegistrarExportacionAsync(
            It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task EvaluarCultivoAsync_ReturnsFalse_WhenExternalFails()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDb_ExternalError")
            .Options;

        using var context = new AppDbContext(options);
        var cultivo = new Cultivo { Id = 2, Nombre = "Trigo", Tipo = "Grano" };
        context.Cultivos.Add(cultivo);
        context.SaveChanges();

        var mockHttpClient = new HttpClient(new FailingHttpHandler());
        var mockConfig = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["IA:EndpointEvaluacion"] = "http://localhost:8000/evaluar-cultivo"
            })
            .Build();
        var mockExportService = new Mock<IDatosAExportarService>();

        var service = new CultivoService(context, mockHttpClient, mockConfig, mockExportService.Object);

        var resultado = await service.EvaluarCultivoAsync(2);

        Assert.False(resultado.esExportable);
        Assert.StartsWith("Error en la evaluación externa", resultado.motivo);

        // No debe intentar registrar exportación
        mockExportService.Verify(m => m.RegistrarExportacionAsync(
            It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    // Fake handler que simula la IA externa sin hacer request real
    public class FakeHttpHandler : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var json = "{\"aptoParaExportacion\": true, \"motivo\": \"Sin plagas\"}";
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            return Task.FromResult(response);
        }
    }

    // Handler que simula un error externo
    public class FailingHttpHandler : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            => throw new HttpRequestException("Error externo");
    }
}
using Xunit;
using ExportModule.Services.Implementaciones;
using ExportModule.Data.Context;
using ExportModule.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace ExportModule.Test.Servicios;

public class DatosAExportarServiceTests
{
    [Fact]
    public async Task RegistrarExportacionAsync_ReturnsId_WhenCultivoExists()
    {
        // Arrange: base de datos en memoria con un cultivo existente
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDb_Exportacion_Exists")
            .Options;

        using var context = new AppDbContext(options);
        var cultivo = new Cultivo { Id = 1, Nombre = "Trigo", Tipo = "Grano" };
        context.Cultivos.Add(cultivo);
        context.SaveChanges();

        var service = new DatosAExportarService(context);

        // Act
        var id = await service.RegistrarExportacionAsync(
            cultivoId: 1,
            tipoDato: "Evaluación",
            formato: "JSON",
            contenido: "{\"cultivoId\":1,\"resultado\":\"apto\"}"
        );

        // Assert
        Assert.NotNull(id);
        var exportacion = await context.DatosAExportar.FindAsync(id);
        Assert.NotNull(exportacion);
        Assert.Equal("Evaluación", exportacion.TipoDato);
        Assert.Equal("JSON", exportacion.Formato);
        Assert.Equal("{\"cultivoId\":1,\"resultado\":\"apto\"}", exportacion.Contenido);
        Assert.Equal(1, exportacion.Cultivo.Id);
    }

    [Fact]
    public async Task RegistrarExportacionAsync_ReturnsNull_WhenCultivoDoesNotExist()
    {
        // Arrange: base de datos en memoria SIN cultivos
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDb_Exportacion_NotExists")
            .Options;

        using var context = new AppDbContext(options);
        var service = new DatosAExportarService(context);

        // Act
        var id = await service.RegistrarExportacionAsync(
            cultivoId: 99,
            tipoDato: "Evaluación",
            formato: "JSON",
            contenido: "{}"
        );

        // Assert
        Assert.Null(id);
        Assert.Empty(context.DatosAExportar);
    }
}
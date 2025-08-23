// using ExportModule.Data.Context;
// using ExportModule.Models;
// using ExportModule.Services.Implementaciones;
// using global::ExportModule.Data.Context;
// using global::ExportModule.Services.Implementaciones;
// using Microsoft.EntityFrameworkCore;
// using System.Linq;
// using System.Threading.Tasks;
// using Xunit;

// namespace ExportModule.Test.Servicios
// {


//     public class ConsultaApiServiceTests
//     {
//         [Fact]
//         public async Task EjecutarConsultaAsync_CreaConsultaYRelacionados()
//         {
//             // Arrange: base de datos en memoria aislada
//             var options = new DbContextOptionsBuilder<AppDbContext>()
//                 .UseInMemoryDatabase(databaseName: "TestDb_ConsultaApi")
//                 .Options;

//             using var context = new AppDbContext(options);

//             var service = new ConsultaApiService(context);

//             // Act
//             var consultaId = await service.EjecutarConsultaAsync();

//             // Assert: la consulta fue guardada y tiene relaciones correctas
//             var consulta = await context.ConsultaAPIs
//                 .Include(c => c.Plagas)
//                 .FirstOrDefaultAsync(c => c.Id == consultaId);

//             Assert.NotNull(consulta);
//             Assert.Equal("http://api.simulada.local/cultivos", consulta.Endpoint);
//             Assert.NotNull(consulta.Plagas);
//             Assert.Equal(3, consulta.Plagas.Count);

//             // Verifica tipos y niveles de plagas
//             var gusano = consulta.Plagas.FirstOrDefault(p => p.Nombre == "Gusano cogollero");
//             Assert.NotNull(gusano);
//             Assert.Equal("moderado", gusano.Nivel);

//             var pulgon = consulta.Plagas.FirstOrDefault(p => p.Nombre == "Pulgón");
//             Assert.NotNull(pulgon);
//             Assert.Equal("leve", pulgon.Nivel);

//             var escarabajo = consulta.Plagas.FirstOrDefault(p => p.Nombre == "Escarabajo de la papa");
//             Assert.NotNull(escarabajo);
//             Assert.Equal("crítico", escarabajo.Nivel);

//             // Verifica que los cultivos existen
//             var cultivos = context.Cultivos.ToList();
//             Assert.Contains(cultivos, c => c.Nombre == "Maíz" && c.Tipo == "Cereal");
//             Assert.Contains(cultivos, c => c.Nombre == "Papa" && c.Tipo == "Tubérculo");
//         }
//     }
// }
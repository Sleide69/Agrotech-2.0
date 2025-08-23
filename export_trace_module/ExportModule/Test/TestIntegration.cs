//using ExportModule.Data.Context;
//using ExportModule.Models;
//using Microsoft.AspNetCore.Mvc.Testing;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.Extensions.Configuration;
//using Microsoft.Extensions.DependencyInjection;
//using Microsoft.Extensions.Hosting;
//using Microsoft.Extensions.Logging;
//using System.Collections.Generic;
//using System.IO;
//using System.Linq;
//using System.Net.Http;
//using System.Net.Http.Headers;
//using System.Text;
//using System.Text.Json;
//using System.Threading.Tasks;
//using Xunit;

//namespace ExportModule.Test;

//public class ConsultaApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
//{
//    private readonly WebApplicationFactory<Program> _factory;
//    private const string JwtKey = "clavepruebasupersegura1234567890123456";
//    private const string JwtIssuer = "test-issuer";
//    private const string JwtAudience = "test-audience";

//    public ConsultaApiIntegrationTests(WebApplicationFactory<Program> factory)
//    {
//        _factory = factory.WithWebHostBuilder(builder =>
//        {
//            builder.UseContentRoot(GetProjectPath());
//            builder.ConfigureAppConfiguration((context, configBuilder) =>
//            {
//                var testConfig = new Dictionary<string, string?>
//                {
//                    ["Jwt:Key"] = JwtKey,
//                    ["Jwt:Issuer"] = JwtIssuer,
//                    ["Jwt:Audience"] = JwtAudience,
//                    ["ConnectionStrings:DefaultConnection"] = "Host=localhost;Database=testdb;Username=testuser;Password=testpw"
//                };
//                configBuilder.AddInMemoryCollection(testConfig);
//            });

//            builder.ConfigureServices(services =>
//            {
//                var dbContextOptionsDescriptors = services
//                    .Where(d => d.ServiceType.Name.Contains("DbContextOptions"))
//                    .ToList();
//                foreach (var descriptor in dbContextOptionsDescriptors)
//                    services.Remove(descriptor);

//                var contextDescriptors = services
//                    .Where(d => d.ServiceType == typeof(AppDbContext))
//                    .ToList();
//                foreach (var descriptor in contextDescriptors)
//                    services.Remove(descriptor);

//                var factoryDescriptors = services
//                    .Where(d => d.ServiceType.Name.Contains("IDbContextFactory"))
//                    .ToList();
//                foreach (var descriptor in factoryDescriptors)
//                    services.Remove(descriptor);

//                services.AddDbContext<AppDbContext>(options =>
//                {
//                    options.UseInMemoryDatabase($"IntegrationTestDb_{Guid.NewGuid()}");
//                });
//            });

//            builder.ConfigureLogging(logging =>
//            {
//                logging.AddConsole();
//                logging.SetMinimumLevel(LogLevel.Debug);
//            });
//        });
//    }

//    [Fact]
//    public async Task EjecutarConsultaApi_Endpoint_RequiereAutenticacionYFunciona()
//    {
//        // Agrega usuario de prueba antes de llamar al endpoint
//        using (var scope = _factory.Services.CreateScope())
//        {
//            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
//            db.Users.Add(new User { Username = "admin", Password = "1234" });
//            db.SaveChanges();
//        }

//        // Crea un token válido para autenticación
//        var jwtToken = JwtTokenHelper.CreateTestToken(
//            key: JwtKey,
//            issuer: JwtIssuer,
//            audience: JwtAudience,
//            username: "admin"
//        );

//        var client = _factory.CreateClient();
//        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);

//        var response = await client.PostAsync("/api/consulta/ejecutar", null);
//        var content = await response.Content.ReadAsStringAsync();

//        if (!response.IsSuccessStatusCode)
//        {
//            Console.WriteLine($"Status: {response.StatusCode}");
//            Console.WriteLine("Headers:");
//            foreach (var header in response.Headers)
//                Console.WriteLine($"{header.Key}: {string.Join(", ", header.Value)}");
//            Console.WriteLine($"Content: {content}");
//            await Task.Delay(500);
//        }

//        Assert.True(response.IsSuccessStatusCode, $"Status: {response.StatusCode}, Content: {content}");

//        using var doc = JsonDocument.Parse(content);
//        Assert.True(doc.RootElement.TryGetProperty("id_consulta", out var idProperty));
//        Assert.True(idProperty.GetInt32() > 0);
//    }

//    private static string GetProjectPath()
//    {
//        var projectName = "ExportModule";
//        var dir = Directory.GetCurrentDirectory();
//        while (!string.IsNullOrEmpty(dir) && !Directory.Exists(Path.Combine(dir, projectName)))
//            dir = Directory.GetParent(dir)?.FullName!;
//        if (string.IsNullOrEmpty(dir))
//            throw new DirectoryNotFoundException($"No se pudo encontrar el directorio raíz '{projectName}' partiendo desde {Directory.GetCurrentDirectory()}");
//        return Path.Combine(dir, projectName);
//    }
//}

//// Puedes dejar el helper aquí mismo, ya que solo lo usas en los tests:
//public static class JwtTokenHelper
//{
//    public static string CreateTestToken(string key, string issuer, string audience, string username)
//    {
//        var securityKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
//        var credentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(securityKey, Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256);

//        var claims = new[]
//        {
//            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, username)
//        };

//        var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
//            issuer: issuer,
//            audience: audience,
//            claims: claims,
//            expires: System.DateTime.UtcNow.AddHours(1),
//            signingCredentials: credentials
//        );

//        return new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(token);
//    }
//}
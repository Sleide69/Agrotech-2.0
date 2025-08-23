using Xunit;
using ExportModule.Controllers;
using ExportModule.Data.Context;
using ExportModule.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace ExportModule.Test.Controllers;

public class AuthControllerTests
{
    [Fact]
    public void Login_ReturnsOkWithToken_WhenCredentialsAreValid()
    {
        // Arrange: Crear un usuario en la base de datos en memoria
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "AuthTestDb_Valid")
            .Options;

        using var context = new AppDbContext(options);
        var user = new User { Id = 1, Username = "testuser", Password = "password123" };
        context.Users.Add(user);
        context.SaveChanges();

        // Configuración JWT simulada
        var configValues = new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "clavepruebasupersegura1234567890123456",
            ["Jwt:Issuer"] = "test-issuer",
            ["Jwt:Audience"] = "test-audience"
        };
        var config = new ConfigurationBuilder().AddInMemoryCollection(configValues).Build();

        var controller = new AuthController(context, config);

        // Act
        var loginUser = new User { Username = "testuser", Password = "password123" };
        var result = controller.Login(loginUser);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var data = okResult.Value as dynamic;
        Assert.NotNull(data.token);
        Assert.IsType<string>(data.token);
        Assert.NotEmpty((string)data.token);
    }

    [Fact]
    public void Login_ReturnsUnauthorized_WhenCredentialsAreInvalid()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "AuthTestDb_Invalid")
            .Options;

        using var context = new AppDbContext(options);
        var user = new User { Id = 1, Username = "testuser", Password = "password123" };
        context.Users.Add(user);
        context.SaveChanges();

        // Configuración JWT simulada
        var configValues = new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "clavepruebasupersegura12345",
            ["Jwt:Issuer"] = "test-issuer",
            ["Jwt:Audience"] = "test-audience"
        };
        var config = new ConfigurationBuilder().AddInMemoryCollection(configValues).Build();

        var controller = new AuthController(context, config);

        // Act
        var loginUser = new User { Username = "testuser", Password = "wrongpassword" };
        var result = controller.Login(loginUser);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        var data = unauthorizedResult.Value as dynamic;
        Assert.NotNull(data.message);
        Assert.Equal("Usuario o contraseña incorrectos", (string)data.message);
    }
}
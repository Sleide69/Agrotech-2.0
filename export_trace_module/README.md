# 🌾 ExportModule

**ExportModule** es un módulo backend desarrollado en C# para gestionar la exportación de productos agrícolas. Evalúa la aptitud de exportación de cultivos en base a su información y presencia de plagas, integrando una IA externa para dicha evaluación.

---

## 📦 Características

- Gestión de **cultivos** y sus respectivas **plagas**.
- Evaluación de exportación mediante un servicio de **IA externa**.
- Registro de resultados en la entidad **DatosAExportar**.
- API REST documentada con **Swagger**.
- Conexión a base de datos PostgreSQL usando **Entity Framework Core**.
- Autenticación JWT para endpoints protegidos.
- Pruebas unitarias y de integración.

---

## 🛠️ Tecnologías y dependencias

- [.NET 9](https://dotnet.microsoft.com/download)
- ASP.NET Core
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/) (`Microsoft.EntityFrameworkCore`, `Npgsql.EntityFrameworkCore.PostgreSQL`)
- [Swagger / Swashbuckle.AspNetCore](https://github.com/domaindrivendev/Swashbuckle.AspNetCore)
- [HttpClient](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclient)
- [AutoMapper](https://automapper.org/)
- [JWT Bearer Authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/jwt) (`Microsoft.AspNetCore.Authentication.JwtBearer`)
- [xUnit](https://xunit.net/)
- [Moq](https://github.com/moq/moq4)
- [Microsoft.AspNetCore.Mvc.Testing](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests)

Instalación de paquetes principales vía NuGet:

```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Swashbuckle.AspNetCore
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
dotnet add package xunit
dotnet add package Moq
dotnet add package Microsoft.AspNetCore.Mvc.Testing
```

---

## 🚀 Ejecución del proyecto

### Prerrequisitos

- .NET SDK 9 o superior
- PostgreSQL
- Visual Studio 2022 o VS Code

### Configuración

1. Crea la base de datos en PostgreSQL.
2. Actualiza el archivo `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=exportdb;Username=postgres;Password=tu_password"
  },
  "IA": {
    "EndpointEvaluacion": "http://localhost:8000/evaluar-cultivo"
  },
  "Jwt": {
    "Key": "clavepruebasupersegura1234567890123456",
    "Issuer": "exportmodule-issuer",
    "Audience": "exportmodule-audience"
  }
}
```

3. Ejecuta las migraciones:

```bash
dotnet ef database update
```

### Ejecutar la aplicación

```bash
dotnet run --project ExportModule
```

Abre Swagger para probar la API:  
🔗 http://localhost:5000/swagger

---

## 🧪 Pruebas

Ejecutar tests:

```bash
dotnet test
```

Incluye pruebas unitarias para lógica de evaluación y persistencia de datos exportables, así como pruebas de integración para endpoints protegidos por JWT.

---

## 📁 Estructura del proyecto

```
ExportModule/
│
├── Controllers/
│   ├── ExportacionController.cs
│   ├── EvaluacionController.cs
│   └── AuthController.cs
│
├── Services/
│   └── Implementaciones/
│       ├── CultivoService.cs
│       ├── DatosAExportarService.cs
│       ├── AgenteEvaluadorService.cs
│       └── ConsultaApiService.cs
│
├── Data/
│   └── Context/
│       └── AppDbContext.cs
│
├── Models/
│   ├── Cultivo.cs
│   ├── Plaga.cs
│   ├── DatosAExportar.cs
│   └── User.cs
│
├── appsettings.json
├── Program.cs
└── ExportModule.Test/
    ├── ConsultaApiIntegrationTests.cs
    └── JwtTokenHelper.cs
```

---

## 📡 Endpoints de la API

### 📍 Evaluación de Cultivo por IA

`POST /api/evaluacion/{cultivoId}`  
Evalúa si un cultivo es apto para exportación según plagas.

#### Ejemplo de respuesta:
```json
{
  "esExportable": true,
  "motivo": "Sin plagas detectadas"
}
```

---

### 📍 Exportaciones

#### `GET /api/exportacion`
Lista todos los datos exportados.

#### `GET /api/exportacion/{id}`
Obtiene una exportación específica.

##### Cuerpo JSON de ejemplo:
```json
{
  "cultivoId": 1,
  "tipoDato": "EvaluaciónIA",
  "formato": "json",
  "contenido": "{ \"Apto\": true, \"Motivo\": \"Sin plagas\" }"
}
```

---

### 📍 Autenticación

#### `POST /api/auth/login`
Obtén un token JWT enviando usuario y contraseña.

##### Cuerpo de solicitud:
```json
{
  "Username": "admin",
  "Password": "1234"
}
```

##### Ejemplo de respuesta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

Utiliza el token en el header:
```
Authorization: Bearer {token}
```

---

## 📝 Notas

- Cambia el valor de la clave JWT y credenciales en producción.
- Siempre ejecuta las migraciones luego de actualizar el modelo de datos.
- Los endpoints de evaluación y exportación requieren autenticación vía JWT.

---
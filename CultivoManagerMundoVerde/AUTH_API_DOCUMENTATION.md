# API de Autenticación - CultivoManager (SIN JWT)

## Endpoints Disponibles

### 1. Registro de Usuario
**POST** `/auth/register`

Permite registrar un nuevo usuario en el sistema.

#### Cuerpo de la petición:
```json
{
    "name": "Juan Pérez",
    "email": "juan.perez",
    "password": "miPassword123",
    "rol": "USER"
}
```

#### Campos:
- `name`: Nombre completo del usuario (requerido)
- `email`: Email del usuario sin dominio (requerido) - se agregará automáticamente "@MundoVerde.ec"
- `password`: Contraseña del usuario (requerido) - será encriptada automáticamente
- `rol`: Rol del usuario (opcional) - por defecto es "USER"

#### Respuesta exitosa (201 Created):
```json
{
    "message": "Usuario registrado exitosamente",
    "user": {
        "id": 1,
        "name": "Juan Pérez",
        "email": "juan.perez@MundoVerde.ec",
        "rol": "USER"
    }
}
```

#### Respuesta si el usuario ya existe (409 Conflict):
```json
{
    "error": "El usuario ya existe"
}
```

### 2. Inicio de Sesión
**POST** `/auth/login`

Permite autenticar un usuario existente.

#### Cuerpo de la petición:
```json
{
    "username": "juan.perez@MundoVerde.ec",
    "password": "miPassword123"
}
```

#### Campos:
- `username`: Email completo del usuario (con @MundoVerde.ec)
- `password`: Contraseña del usuario

#### Respuesta exitosa (200 OK):
```json
{
    "message": "Login exitoso",
    "user": {
        "id": 1,
        "name": "Juan Pérez",
        "email": "juan.perez@MundoVerde.ec",
        "rol": "USER"
    }
}
```

#### Respuesta si las credenciales son incorrectas (401 Unauthorized):
```json
{
    "error": "Credenciales invalidas"
}
```

#### Respuesta si el usuario no existe (401 Unauthorized):
```json
{
    "error": "Usuario no encontrado"
}
```

## Ejemplos de uso con curl

### Registrar un nuevo usuario:
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María González",
    "email": "maria.gonzalez",
    "password": "password123",
    "rol": "ADMIN"
  }'
```

### Iniciar sesión:
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "maria.gonzalez@MundoVerde.ec",
    "password": "password123"
  }'
```

## Notas importantes

1. **🚫 JWT DESACTIVADO**: El sistema ya NO utiliza tokens JWT. La autenticación es básica por sesión.

2. **🔓 Sin autenticación de endpoints**: Todos los endpoints de la API están ahora accesibles sin autenticación.

3. **Dominio automático**: El sistema agrega automáticamente "@MundoVerde.ec" al email durante el registro.

4. **Encriptación de contraseñas**: Las contraseñas se encriptan automáticamente usando BCrypt.

5. **Roles disponibles**: USER, ADMIN (se pueden extender según necesidades)

6. **Validación de duplicados**: El sistema verifica que no existan usuarios duplicados por email.

7. **⚠️ IMPORTANTE**: Al no tener JWT, no hay control de acceso a recursos protegidos. Todos los endpoints son públicos.

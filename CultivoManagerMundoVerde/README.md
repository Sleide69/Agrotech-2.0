# 🌱 CultivoManager

# 👨‍💻 Autor
Walther Javier Gutierrez Loor

**CultivoManager** es una aplicación backend desarrollada en **Java con Spring Boot**, enfocada en la gestión de cultivos agrícolas. Permite el control de usuarios, zonas de cultivo, sensores y riegos. Además, incorpora seguridad basada en JWT y pruebas automatizadas (unitarias e integración) para garantizar la calidad del software.

---

## 📦 Características

- Gestión de entidades como **Usuarios**, **Cultivos**, **Zonas de Cultivo**, **Sensores** y **Riegos**.
- API REST completa para operaciones CRUD.
- Autenticación y autorización con **JWT**.
- Arquitectura modular con separación por capas (controlador, servicio, repositorio).
- Integración con **PostgreSQL**.
- Pruebas unitarias y de integración usando **JUnit**, **Mockito** y **MockMvc**.

---

## 🛠️ Tecnologías y dependencias

- [Java 17+](https://openjdk.org/)
- [Spring Boot 3.x](https://spring.io/projects/spring-boot)
- Spring Web
- Spring Data JPA
- Spring Security + JWT
- PostgreSQL Driver
- Lombok
- JUnit 5 + Mockito
- Jackson (con módulo `jsr310` para `LocalDate`)
- Swagger (opcional para documentación)

# Dependencias en `pom.xml` :

```xml
<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-thymeleaf</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.postgresql</groupId>
			<artifactId>postgresql</artifactId>
			<version>42.7.2</version>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>

		<!-- Spring Security -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-security</artifactId>
		</dependency>

		<!-- JWT (JJWT) -->
		<dependency>
		    <groupId>io.jsonwebtoken</groupId>
		    <artifactId>jjwt-api</artifactId>
		    <version>0.11.5</version>
		</dependency>
		<dependency>
		    <groupId>io.jsonwebtoken</groupId>
		    <artifactId>jjwt-impl</artifactId>
		    <version>0.11.5</version>
		    <scope>runtime</scope>
		</dependency>
		<dependency>
		    <groupId>io.jsonwebtoken</groupId>
		    <artifactId>jjwt-jackson</artifactId>
		    <version>0.11.5</version>
		    <scope>runtime</scope>
		</dependency>

		<!-- Base de datos en memoria H2 para pruebas -->
		<dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
			<scope>test</scope>
		</dependency>

		<!-- Mockito para tests con mocks (opcional pero recomendado) -->
		<dependency>
			<groupId>org.mockito</groupId>
			<artifactId>mockito-core</artifactId>
			<scope>test</scope>
		</dependency>

		<dependency>
		    <groupId>com.fasterxml.jackson.datatype</groupId>
		    <artifactId>jackson-datatype-jsr310</artifactId>
		</dependency>
	</dependencies>
```

---

## 🚀 Ejecución del proyecto

### Requisitos

- JDK 17+
- PostgreSQL
- Maven o Gradle
- IDE como IntelliJ o VS Code

### Configuración

1. Crea la base de datos en PostgreSQL (ej. `cultivomanager`).
2. En `application.properties` o `application.yml`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/cultivo_manager_db
spring.datasource.username=postgres
spring.datasource.password=tu_contraseña
spring.jpa.hibernate.ddl-auto=update
jwt.secret=clave-secreta-segura
```

3. Ejecuta el proyecto:

```bash
./mvnw spring-boot:run
```

---

## 🔐 Autenticación

Se implementa autenticación **JWT** para proteger los endpoints.

### `POST /api/auth/login`

```json
{
  "email": "usuario@example.com(ejemplo)",
  "password": "123456(ejemplo)"
}
```

**Respuesta:**

```json
{
  "token": " skdasdada (ejemplo)..."
}
```

Usar en el header:

```
Authorization: Bearer {token}
```

---

## 🧪 Pruebas

Para ejecutar pruebas:

```bash
./mvnw test
```

Incluye:

- ✅ Pruebas unitarias para servicios (`UsuarioService`, `CultivoService`, etc.)
- ✅ Pruebas de integración con `MockMvc` para controladores (`UsuarioController`, `CultivoController`)
- Soporte para `LocalDate` con Jackson (`jackson-datatype-jsr310`)

---

## 📁 Estructura del proyecto

src/
├── main/
│   ├── java/
│   │   └── com/mundoverde/cultivomanager/
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── repositories/
│   │       └── models/
│   └── resources/
│       └── application.properties
└── test/
    └── java/
        └── com/mundoverde/cultivomanager/


---

## 📡 Endpoints REST (ejemplos)

### Usuarios

- `POST /api/usuarios`
- `GET /api/usuarios/{email}`

### Cultivos

- `GET /api/cultivos`
- `GET /api/cultivos/{id}`
- `POST /api/cultivos`
- `PUT /api/cultivos/{id}`
- `DELETE /api/cultivos/{id}`

---

## 📝 Notas finales

- Personaliza la clave JWT en producción.
- Usa `@AutoConfigureMockMvc(addFilters = false)` en tests si deseas omitir filtros de seguridad.
- Las entidades usan `LocalDate` como tipo de fecha, asegurando soporte con Jackson (`jsr310`).

# Se agradece

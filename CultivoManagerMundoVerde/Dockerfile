# Usa JDK 17 con imagen ligera
FROM eclipse-temurin:17-jdk-alpine

# Crea y entra al directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el JAR generado en la carpeta target
COPY target/CultivoManager-0.0.1-SNAPSHOT.jar app.jar

# Expone el puerto en el que la app escucha
EXPOSE 8000

# Comando para ejecutar la app
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5197
ENV ASPNETCORE_URLS=http://0.0.0.0:5197

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ExportModule.csproj ./
RUN dotnet restore "ExportModule.csproj"
COPY . .
RUN dotnet publish "ExportModule.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ExportModule.dll"]

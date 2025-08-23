#!/bin/bash
set -e

# Script de inicialización para la base de datos
echo "🏗️  Inicializando base de datos ClimaMundoverde-db..."

# Crear esquemas adicionales si son necesarios
# psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
#     CREATE SCHEMA IF NOT EXISTS clima;
#     CREATE SCHEMA IF NOT EXISTS logs;
# EOSQL

echo "✅ Base de datos inicializada correctamente"

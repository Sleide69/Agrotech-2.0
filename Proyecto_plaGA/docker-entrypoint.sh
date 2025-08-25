#!/usr/bin/env sh
set -eu

# Si no existe .env, crear a partir de ejemplo
if [ ! -f .env ]; then
  cp .env.example .env || true
fi

# Generar APP_KEY si falta
if ! grep -q "^APP_KEY=" .env || grep -q "^APP_KEY=$" .env; then
  php artisan key:generate --force || true
fi

# Configurar cache de config/route/view
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Migraciones (sin detener si falla por primera vez)
php artisan migrate --force || true

# Asegurar que PHP-FPM escuche en 0.0.0.0:9000 (necesario para Nginx en otro contenedor)
if [ -f /usr/local/etc/php-fpm.d/www.conf ]; then
  # Escuchar en TCP para permitir proxy desde Nginx en otro contenedor
  sed -ri 's#^listen\s*=.*#listen = 0.0.0.0:9000#' /usr/local/etc/php-fpm.d/www.conf || true

  # No forzar listen.allowed_clients: por defecto permite cualquier cliente en TCP.
  # Si existe una línea previa, coméntala para evitar restricciones que bloqueen a Nginx.
  if grep -Eq '^\s*listen\.allowed_clients' /usr/local/etc/php-fpm.d/www.conf; then
    sed -ri 's#^\s*listen\.allowed_clients#; listen.allowed_clients#' /usr/local/etc/php-fpm.d/www.conf || true
  fi

  # Evitar que se limpie el entorno para respetar variables
  if grep -q '^;*\s*clear_env' /usr/local/etc/php-fpm.d/www.conf; then
    sed -ri 's#^;*\s*clear_env\s*=.*#clear_env = no#' /usr/local/etc/php-fpm.d/www.conf || true
  else
    echo 'clear_env = no' >> /usr/local/etc/php-fpm.d/www.conf
  fi
fi

exec "$@"


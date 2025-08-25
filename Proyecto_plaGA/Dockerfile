FROM php:8.2-fpm-alpine AS app

# Paquetes necesarios para compilar extensiones y cliente de Postgres
RUN set -eux; \
        apk add --no-cache \
            git \
            unzip \
            bash \
            postgresql-client \
            postgresql-dev \
            $PHPIZE_DEPS; \
        docker-php-ext-install pdo pdo_pgsql; \
        apk del --no-cache $PHPIZE_DEPS

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Instalar dependencias PHP primero para mejor cache (sin scripts de artisan)
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-scripts --optimize-autoloader

# Copiar el resto del código
COPY . .

# Permisos para Laravel
RUN mkdir -p storage bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

# Variables de entorno útiles
ENV PHP_FPM_LISTEN=0.0.0.0:9000 \
    APP_ENV=production \
    APP_DEBUG=false

# Entrypoint para preparar app
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["php-fpm", "-F"]

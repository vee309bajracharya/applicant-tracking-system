FROM php:8.3-cli

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libpq-dev \
    libzip-dev \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_pgsql pdo_mysql gd zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

COPY . .

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader

RUN ln -sfn /var/www/html/storage/app/public /var/www/html/public/storage \
    && chown -R www-data:www-data storage bootstrap/cache

USER www-data

CMD ["sh", "-c", "set -e; php artisan migrate --force; php artisan db:seed --class=RolesAndPermissionsSeeder --force; exec php -S 0.0.0.0:${PORT:-10000} -t public"]
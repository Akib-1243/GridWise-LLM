FROM php:8.3-fpm-alpine

RUN apk add --no-cache sqlite-dev icu-dev \
    && docker-php-ext-install pdo_sqlite intl \
    && apk del sqlite-dev

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html

COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-progress --no-scripts

COPY . .
RUN composer dump-autoload --no-dev --classmap-authoritative --no-scripts
RUN mkdir -p database storage/framework/cache storage/framework/sessions storage/framework/views \
    && touch database/database.sqlite \
    && chown -R www-data:www-data storage database

EXPOSE 9000

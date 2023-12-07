FROM composer:2 AS vendor

WORKDIR /app

COPY ./admin .

RUN composer update --ignore-platform-reqs

FROM php:8.2-fpm

# Install dependencies for the operating system software
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    libzip-dev \
    unzip \
    git \
    libonig-dev \
    curl

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install extensions for php
RUN docker-php-ext-install pdo_mysql mbstring zip exif pcntl
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install gd


WORKDIR /home/app

COPY --from=vendor /app .


RUN chown -R www-data:www-data \
        /home/app/storage \
        /home/app/bootstrap/cache

CMD php artisan serve --host=0.0.0.0
EXPOSE 8000
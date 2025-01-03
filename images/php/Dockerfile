FROM docker.arvancloud.ir/php:8.2-fpm

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
    curl \
    supervisor

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install extensions for php
RUN docker-php-ext-install pdo_mysql mbstring zip exif pcntl
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install gd
RUN docker-php-ext-install sockets

WORKDIR /home/app

COPY /admin .

COPY /images/php/php.ini /usr/local/etc/php
COPY /supervisors/admin/admin-consumers.conf /etc/supervisor/conf.d

COPY /images/php/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod a+x /usr/local/bin/entrypoint.sh


RUN chown -R www-data:www-data \
        /home/app/storage \
        /home/app/bootstrap/cache

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN composer install --ignore-platform-reqs

EXPOSE 8000

ENTRYPOINT /usr/local/bin/entrypoint.sh
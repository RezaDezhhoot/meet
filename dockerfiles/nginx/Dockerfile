FROM nginx:latest

COPY ./dockerfiles/nginx/Dockerfile /etc/nginx/conf.d/default.conf

COPY ./admin /home/app

RUN chgrp -R www-data /home/app
RUN chmod -R 775 /home/app/storage


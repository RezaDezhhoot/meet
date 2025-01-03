# entrypoint.sh
#!/bin/sh

php /home/app/artisan optimize:clear

php /home/app/artisan optimize

php /home/app/artisan migrate --force

php /home/app/artisan storage:link

service supervisor start

php /home/app/artisan serve --host=0.0.0.0

exec "$@"
FROM nginx:latest

COPY ./dockerfiles/nginx/Dockerfile /etc/nginx/conf.d/default.conf

COPY ./src /home/app


CMD ["chown","-R" ,"www-data:www-data","/home/app/storage"]
CMD ["chown","-R" ,"www-data:www-data","/home/app/bootstrap/cache"]
CMD ["chmod","-R" ,"775","/home/app/storage"]
CMD chmod -R 775 /home/app/bootstrap/cache
CMD ["nginx", "-g", "daemon off;"]

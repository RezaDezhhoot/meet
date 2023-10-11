FROM node:14

RUN npm install -g http-server

WORKDIR /app

COPY ./frontend/package*.json /app

RUN npm install

COPY ./frontend .

RUN npm run build
RUN npm run dev

EXPOSE 8080

CMD [ "http-server", "dist" ]
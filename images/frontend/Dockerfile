FROM node

WORKDIR /app

COPY ./frontend .

RUN npm install

RUN npm run build

RUN npm install -g serve

EXPOSE 4173

CMD [ "serve", "-s" , "dist" , "-p" ,"4173"]
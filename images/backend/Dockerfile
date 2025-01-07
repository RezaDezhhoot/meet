# Use an official Node.js runtime as the base image
FROM docker.arvancloud.ir/node:22

RUN apt-get update && apt-get install -y \
                        build-essential \
                        gcc \
                        g++ \
                        make \
                        python3 \
                        libtool \
                        automake \
                        nasm

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY ./backend/package*.json .

# Install app dependencies
RUN npm install

RUN npm rebuild mediasoup --build-from-source

RUN npm install -g nodemon@2.0.7

EXPOSE 3000
EXPOSE 10000-10500

# Copy the rest of the application code
COPY ./backend .

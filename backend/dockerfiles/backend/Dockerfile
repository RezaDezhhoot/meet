# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY ./src/package*.json .

# Install app dependencies
RUN npm install

RUN npm install -g nodemon@2.0.7

EXPOSE 3000
# Copy the rest of the application code
COPY ./src .

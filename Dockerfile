# Create image based on the official Node 6 image from dockerhub
#FROM node:6
#FROM node:7.7.2-alpine

# Create a directory where our app will be placed
#RUN mkdir -p /usr/src/app

# Change directory so that our commands run inside this new directory
#WORKDIR /usr/src/app

# Copy dependency definitions
#COPY app/package.json /usr/src/app

# Install dependecies
#RUN npm install --quiet

# Get all the code needed to run the app
#COPY app/www /usr/src/app
#COPY app/server.js /usr/src/app

# Expose the port the app runs in
#EXPOSE 8080

#RUN ls

# Serve the app
#CMD ["npm", "start"]

FROM node

WORKDIR /usr/src/app

COPY app/package.json .

RUN npm install

#COPY . .
COPY app/www /usr/src/app
COPY app/server.js /usr/src/app
EXPOSE 8080
CMD ["npm", "start"]
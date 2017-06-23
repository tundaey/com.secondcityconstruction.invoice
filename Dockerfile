FROM node

RUN mkdir /src

WORKDIR /src
ADD app/package.json /src/package.json
ADD app/www /src/www
ADD app/server.js /src/server.js
RUN npm install

EXPOSE 3000

CMD node app/src/server.js
FROM node:10

COPY package*.json /opt/app/
WORKDIR /opt/app
RUN npm config set proxy $http_proxy \
    && npm install \
    && npm config delete proxy

COPY . /opt/app

EXPOSE 8095
CMD [ "node", "peerserver.js" ]

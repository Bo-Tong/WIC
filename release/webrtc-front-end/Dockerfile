FROM node:10

WORKDIR /opt/app/web_src
COPY web_src/package*.json ./
RUN npm config set proxy $http_proxy \
    && npm install \
    && npm config delete proxy

COPY . /opt/app

WORKDIR /opt/app/www

ENTRYPOINT ["/opt/app/entrypoint.sh"]

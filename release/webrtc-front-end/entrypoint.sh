#!/bin/bash

function build_static_web_source() {
    cd /opt/app/web_src
    npm run build
    rm -rf /opt/app/www/web
    cp -r build /opt/app/www/web
}

sed -i "s/MASTER_NODE_IP/$MASTER_NODE_IP/g" /opt/app/www/original/js/gaming.js
sed -i "s/MASTER_NODE_IP/$MASTER_NODE_IP/g" /opt/app/web_src/.env*
sed -i "s/USE_HOUDINI/$USE_HOUDINI/g" /opt/app/web_src/.env*
if [[ $K8S_ENV = "true" ]]; then
    sed -i "s/SIGNAL_PORT/30000/g" /opt/app/www/original/js/gaming.js
else
    sed -i "s/SIGNAL_PORT/8095/g" /opt/app/www/original/js/gaming.js
fi

[[ $K8S_ENV_STATELESS = "true" ]] && build_static_web_source

cd /opt/app/www
./web-backend-entry

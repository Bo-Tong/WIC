mkdir -p $PWD/code $PWD/output
docker build -t media-builder --build-arg http_proxy=$http_proxy .
docker run -ti --rm -v $PWD/code:/code -v $PWD/output:/output -e https_proxy=$https_proxy --device /dev/dri:/dev/dri media-builder
 

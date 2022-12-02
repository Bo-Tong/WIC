FROM ubuntu:20.04

ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    git vim cmake meson g++ pkg-config doxygen \
    libdrm-dev libx11-dev libxext-dev libxfixes-dev \
 && rm -rf /var/lib/apt/lists/*

COPY ./build-driver.sh /build-driver.sh

ENV BUILD_FROM_CONTAINER=true
ENTRYPOINT [ "/build-driver.sh" ]


#!/bin/bash

#if build from host, install the required pkgs
if [ -z "$BUILD_FROM_CONTAINER" ]; then
  sudo apt install git vim cmake meson g++ pkg-config doxygen libdrm-dev libx11-dev libxext-dev libxfixes-dev
fi

ROOT=$PWD

if [ ! -d $ROOT/code ]; then
  mkdir -p $ROOT/code
fi

if [ ! -d $ROOT/output ]; then
   mkdir -p $ROOT/output
fi

if [ ! -d $ROOT/code/libva ]; then
   git clone https://github.com/intel/libva.git $ROOT/code/libva
fi

if [ ! -d $ROOT/code/gmmlib ]; then
   git clone https://github.com/intel/gmmlib.git $ROOT/code/gmmlib
fi

if [ ! -d $ROOT/code/media-driver ]; then
   git clone https://github.com/intel/media-driver.git $ROOT/code/media-driver
fi

rm -rf /output/*

cd $ROOT/code/libva
rm -rf build
meson --prefix=/usr --libdir=/usr/lib/x86_64-linux-gnu build
ninja -C build install
DESTDIR=$ROOT/output ninja -C build install

cd $ROOT/code/gmmlib
rm -rf build && mkdir build && cd build
cmake --prefix=/usr --libdir=/usr/lib/x86_64-linux-gnu ..
make install -j`nproc`
make install DESTDIR=$ROOT/output

cd $ROOT/code/media-driver
rm -rf build && mkdir build && cd build
cmake --prefix=/usr --libdir=/usr/lib/x86_64-linux-gnu -DENABLE_PRODUCTION_KMD=ON ..
make install -j`nproc`
make install DESTDIR=$ROOT/output


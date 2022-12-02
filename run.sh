#1 build intel media driver from open source code for streamer
cd release/streamer/ && ./Readme

#2 config you own app in the weston container
cd release/wic/ && cat Readme

#3 re-generate the docker images if needed.
if [ -d image ]; then
  cd image
  ./wic-cloud uninstall
  sudo rm -rf workdir
  cd ..
fi
./release/tool/gen-img-pkg -f

#4 run wic
cd image
./wic-cloud install -s 1920x1080 -g hw -n 2
./wic-cloud start

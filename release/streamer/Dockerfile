FROM ubuntu:20.04

ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    libssl1.1 inotify-tools netcat-openbsd libdw1 libunwind8 \
    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
    libgbm1 libgl1-mesa-dri libavcodec58 libavfilter7 \
    pulseaudio libset-scalar-perl\
 && rm -rf /var/lib/apt/lists/*

COPY streamer /
COPY app.cfg /
COPY bin /usr/bin/
COPY libs /libs/
COPY ./media/usr /usr

# set the default sample rate for the pa daemon as required
RUN echo "default-sample-rate = 48000" >> /etc/pulse/daemon.conf

ARG USR=streamer
ARG UID=1000
ARG GID=1000

# render group number should match with host's:
# cat /etc/group |grep render. E.g., render:x:109:
RUN groupadd -g $GID $USR && \
    groupadd -g 109 -f render  && \
    useradd -m -g $USR -G audio,irc,render,video -u $UID -s /bin/bash $USR

USER $USR

# CAUTION: do not change the WORKDIR
# currently streamer only works with pwd as /
# otherwise it will fail to connect to the hwc

ENTRYPOINT [ "/streamer" ]

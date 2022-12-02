FROM ubuntu:20.04

ARG DEBIAN_FRONTEND=noninteractive

# Install Chrome
RUN apt update && apt install -y gnupg
COPY google-chrome.list /etc/apt/sources.list.d/google-chrome.list
COPY linux_signing_key.pub /
RUN cat /linux_signing_key.pub | apt-key add -
RUN apt update && apt install -y google-chrome-stable

# Install Steam
RUN dpkg --add-architecture i386
RUN apt-get install -y software-properties-common
Run add-apt-repository -y multiverse 
RUN apt update
RUN apt dist-upgrade -y
RUN apt install -y steam

# Install and start weston
RUN apt update && apt install -y weston xwayland
RUN mkdir -p /tmp/.X11-unix
ENV XDG_RUNTIME_DIR /tmp
COPY weston.ini /root/.config/
COPY x86_64-linux-gnu /usr/lib/x86_64-linux-gnu
COPY entrypoint /

ENTRYPOINT [ "/entrypoint" ]

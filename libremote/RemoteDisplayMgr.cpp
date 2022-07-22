//#define LOG_NDEBUG 0

#include <sys/epoll.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/un.h>

#include "RemoteDisplayMgr.h"

uint64_t RemoteDisplayMgr::sNextId = 1;

RemoteDisplayMgr::RemoteDisplayMgr() {}
RemoteDisplayMgr::~RemoteDisplayMgr() {
  if (mServerFd >= 0) {
    close(mServerFd);
  }
}

int RemoteDisplayMgr::init() {
  mEpollFd = epoll_create(kMaxEvents);
  if (mEpollFd == -1) {
    printf("epoll_create:%s\n", strerror(errno));
    return -1;
  }

  mSocketThread = new std::thread(&RemoteDisplayMgr::socketThreadProc, this);
  return 0;
}

int RemoteDisplayMgr::addRemoteDisplay(int fd) {
  printf("%s(%d)\n", __func__, fd);

  setNonblocking(fd);
  addEpollFd(fd);

  mRemoteDisplays.emplace(fd, fd);
  auto& remote = mRemoteDisplays.at(fd);
  remote.setDisplayStatusListener(this);
  if (remote.getConfigs() < 0) {
    printf("Failed to init remote display!\n");
    return -1;
  }
  return 0;
}

int RemoteDisplayMgr::removeRemoteDisplay(int fd) {
  delEpollFd(fd);

  if (mRemoteDisplays.find(fd) != mRemoteDisplays.end()) {
    mRemoteDisplays.erase(fd);
  }

  return 0;
}

int RemoteDisplayMgr::connectToRemote() {
  struct sockaddr_un addr;
  std::unique_lock<std::mutex> lck(mConnectionMutex);

  mClientFd = socket(AF_UNIX, SOCK_STREAM, 0);
  if (mClientFd < 0) {
    printf("Can't create socket, it will run as server mode\n");
    return -1;
  }

  memset(&addr, 0, sizeof(addr));
  addr.sun_family = AF_UNIX;
  strncpy(&addr.sun_path[0], kClientSock, strlen(kClientSock));
  if (connect(mClientFd, (struct sockaddr*)&addr,
              sizeof(sa_family_t) + strlen(kClientSock) + 1) < 0) {
    printf("Can't connect to remote, it will run as server mode\n");
    close(mClientFd);
    mClientFd = -1;
    return -1;
  }
  if (mClientFd >= 0) {
    addRemoteDisplay(mClientFd);
  }

  // wait the display config ready
  mClientConnected.wait(lck);
  return 0;
}

int RemoteDisplayMgr::disconnectToRemote() {
  removeRemoteDisplay(mClientFd);
  close(mClientFd);
  mClientFd = -1;
  return 0;
}

int RemoteDisplayMgr::attach(RemoteDisplay* rd) {
  if (!rd)
    return -1;

  mRemoteDisplay = rd;
  mWidth = mRemoteDisplay->width();
  mHeight = mRemoteDisplay->height();
  mFramerate = mRemoteDisplay->fps();
  mXDpi = mRemoteDisplay->xdpi();
  mYDpi = mRemoteDisplay->ydpi();

  display_flags flags;
  flags.value = mRemoteDisplay->flags();
  mVersion = flags.version;
  mMode = flags.mode;

  printf("RemoteDisplayMgr(%ld)::%s, w=%d,h=%d,fps=%d, xdpi=%d,ydpi=%d, protocal "
        "version=%d, mode=%d\n",
        rd->getDisplayId(), __func__, mWidth, mHeight, mFramerate, mXDpi, mYDpi,
        mVersion, mMode);

  return 0;
}

int RemoteDisplayMgr::detach(RemoteDisplay* rd) {
  if (rd == mRemoteDisplay) {
    mRemoteDisplay = nullptr;
  }
  return 0;
}


int RemoteDisplayMgr::addRemoteDisplay(RemoteDisplay* rd) {
  if (!rd)
    return -1;

  auto id = sNextId++;
  rd->setDisplayId(id);

  printf("%s: add new display %ld\n", __func__, id);
  attach(rd);

  return 0;
}

int RemoteDisplayMgr::removeRemoteDisplay(RemoteDisplay* rd) {
  if (!rd)
    return -1;

  uint64_t id = rd->getDisplayId();

  printf("%s: remove display %ld\n", __func__, id);
  detach(rd);

  return 0;
}

int RemoteDisplayMgr::getMaxRemoteDisplayCount() {
  return 1;//kMaxDisplayCount;
}

int RemoteDisplayMgr::getRemoteDisplayCount() {
  return 1;//mDisplays.size() - 1;
}

int RemoteDisplayMgr::present() {
  if (mRemoteDisplay != nullptr && mFbTarget != nullptr) {
        mRemoteDisplay->displayBuffer(mFbTarget);
  }
  return 0;
}

int RemoteDisplayMgr::setClientTarget(gbm_import_fd_data* target) {
  mFbTarget = target;

  if (mRemoteDisplay != nullptr) {
    bool isNew = true;

    for (auto fbt : mFbtBuffers) {
      if (fbt == mFbTarget) {
        isNew = false;
      }
    }
    if (isNew) {
      mFbtBuffers.push_back(mFbTarget);
      mRemoteDisplay->createBuffer(mFbTarget);
    }
  }
  return 0;
}

int RemoteDisplayMgr::onConnect(int fd) {
  std::unique_lock<std::mutex> lck(mConnectionMutex);

  if (mRemoteDisplays.find(fd) != mRemoteDisplays.end()) {
    printf("Remote Display %d connected\n", fd);
    addRemoteDisplay(&mRemoteDisplays.at(fd));
  }
  mClientConnected.notify_all();
  return 0;
}

int RemoteDisplayMgr::onDisconnect(int fd) {
  printf("Remote Display %d disconnected\n", fd);
  return 0;
}

int RemoteDisplayMgr::setNonblocking(int fd) {
  int flag = 1;
  if (ioctl(fd, FIONBIO, &flag) < 0) {
    printf("set client socket to FIONBIO failed\n");
    return -1;
  }
  return 0;
}

int RemoteDisplayMgr::addEpollFd(int fd) {
  struct epoll_event ev;

  ev.events = EPOLLIN;
  ev.data.fd = fd;
  if (epoll_ctl(mEpollFd, EPOLL_CTL_ADD, fd, &ev) == -1) {
    printf("epoll_ctl add fd %d:%s\n", fd, strerror(errno));
    exit(EXIT_FAILURE);
  }
  return 0;
}

int RemoteDisplayMgr::delEpollFd(int fd) {
  struct epoll_event ev;

  ev.events = EPOLLIN;
  ev.data.fd = fd;
  if (epoll_ctl(mEpollFd, EPOLL_CTL_DEL, fd, &ev) == -1) {
    printf("epoll_ctl del fd %d:%s\n", fd, strerror(errno));
    exit(EXIT_FAILURE);
  }
  return 0;
}

void RemoteDisplayMgr::socketThreadProc() {
  mServerFd = socket(AF_UNIX, SOCK_STREAM, 0);
  if (mServerFd < 0) {
    printf("Failed to create server socket\n");
    return;
  }

  int value = 0;
  if (getenv("CONTAINER_ID")) {
    value = atoi(getenv("CONTAINER_ID"));
  }

  char kServerSockId[127];
  char workdir_ipc[63];
  if (getenv("K8S_ENV") != NULL && strcmp(getenv("K8S_ENV"), "true") == 0)
    sprintf(kServerSockId,"%s","/conn/hwc-sock");
  else
    if (getenv("WORKDIR_IPC") == NULL)
      sprintf(kServerSockId,"%s%d", "/workdir/ipc/hwc-sock", value);
    else
      sprintf(kServerSockId,"%s%s%d", getenv("WORKDIR_IPC"), "hwc-sock", value);
  printf("hwc socket: %s\n", kServerSockId);

  setNonblocking(mServerFd);
  addEpollFd(mServerFd);

  struct sockaddr_un addr;
  memset(&addr, 0, sizeof(addr));
  addr.sun_family = AF_UNIX;
  strncpy(&addr.sun_path[0], kServerSockId, strlen(kServerSockId));

  unlink(kServerSockId);
  if (bind(mServerFd, (struct sockaddr*)&addr,
           sizeof(sa_family_t) + strlen(kServerSockId) + 1) < 0) {
    printf("Failed to bind server socket address\n");
    return;
  }

  // TODO: use group access only for security
  struct stat st;
  __mode_t mod = S_IRUSR | S_IWUSR | S_IRGRP | S_IWGRP | S_IROTH | S_IWOTH;
  if (fstat(mServerFd, &st) == 0) {
    mod |= st.st_mode;
  }
  chmod(kServerSockId, mod);

  if (listen(mServerFd, 1) < 0) {
    printf("Failed to listen on server socket\n");
    return;
  }

  while (true) {
    struct epoll_event events[kMaxEvents];
    int nfds = epoll_wait(mEpollFd, events, kMaxEvents, -1);
    if (nfds < 0) {
      nfds = 0;
      if (errno != EINTR) {
        printf("epoll_wait:%s\n", strerror(errno));
      }
    }

    for (int n = 0; n < nfds; ++n) {
      if (events[n].data.fd == mServerFd) {
        struct sockaddr_un addr;
        socklen_t sockLen = sizeof(addr);
        int clientFd = -1;

        clientFd = accept(mServerFd, (struct sockaddr*)&addr, &sockLen);
        if (clientFd < 0) {
          perror("Failed to accept client connection\n");
          break;
        }

      addRemoteDisplay(clientFd);

      } else {
        int fd = events[n].data.fd;
        if (mRemoteDisplays.find(fd) != mRemoteDisplays.end()) {
          mRemoteDisplays.at(fd).onDisplayEvent();
        } else {
          // This shouldn't happen, something is wrong if go here
          printf("No remote display for %d\n", events[n].data.fd);
          delEpollFd(events[n].data.fd);
          close(events[n].data.fd);
        }
      }
    }
  }
}

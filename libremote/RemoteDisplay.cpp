//#define LOG_NDEBUG 0

#include <inttypes.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include "RemoteDisplay.h"

//#define DEBUG_LAYER
#ifdef DEBUG_LAYER
#define LAYER_TRACE(...) printf(__VA_ARGS__)
#else
#define LAYER_TRACE(...)
#endif

RemoteDisplay::RemoteDisplay(int fd) : mSocketFd(fd) {}
RemoteDisplay::~RemoteDisplay() {
  if (mSocketFd >= 0) {
    printf("Close socket %d\n", mSocketFd);
    close(mSocketFd);
  }
}

int RemoteDisplay::_send(const void* buf, size_t n) {
  if (mDisconnected)
    return -1;

  if (!buf || n <= 0)
    return 0;

  ssize_t len;
  len = send(mSocketFd, buf, n, 0);
  if (len <= 0) {
    mDisconnected = true;
    if (mStatusListener) {
      mStatusListener->onDisconnect(mSocketFd);
    }
    return -1;
  }
  return 0;
}
int RemoteDisplay::_recv(void* buf, size_t n) {
  if (mDisconnected)
    return -1;

  if (!buf || n <= 0)
    return 0;

  ssize_t len;
  len = recv(mSocketFd, buf, n, 0);
  if (len <= 0) {
    mDisconnected = true;
    if (mStatusListener) {
      mStatusListener->onDisconnect(mSocketFd);
    }
    return -1;
  }
  return 0;
}

int RemoteDisplay::_sendFds(int* pfd, size_t fdlen) {
  if (mDisconnected)
    return -1;

  int count = 0;
  int i = 0;
  struct msghdr msg;
  struct cmsghdr* p_cmsg;
  struct iovec vec;
  char cmsgbuf[CMSG_SPACE(fdlen * sizeof(int))];
  int* p_fds = NULL;
  int sdata[4] = {
      0x88,
  };

  msg.msg_control = cmsgbuf;
  msg.msg_controllen = sizeof(cmsgbuf);
  p_cmsg = CMSG_FIRSTHDR(&msg);
  p_cmsg->cmsg_level = SOL_SOCKET;
  p_cmsg->cmsg_type = SCM_RIGHTS;
  p_cmsg->cmsg_len = CMSG_LEN(fdlen * sizeof(int));
  p_fds = (int*)CMSG_DATA(p_cmsg);

  for (i = 0; i < (int)fdlen; i++) {
    p_fds[i] = pfd[i];
  }

  msg.msg_name = NULL;
  msg.msg_namelen = 0;
  msg.msg_iov = &vec;
  msg.msg_iovlen = 1;
  msg.msg_flags = 0;

  vec.iov_base = sdata;
  vec.iov_len = 16;
  count = sendmsg(mSocketFd, &msg, 0);
  if (count <= 0) {
    mDisconnected = true;
    if (mStatusListener) {
      mStatusListener->onDisconnect(mSocketFd);
    }
    return -1;
  }

  return 0;
}

int RemoteDisplay::getConfigs() {
  char value[255] = "0";
  display_event_t req;

  memset(&req, 0, sizeof(req));
  req.type = DD_EVENT_DISPINFO_REQ;
  req.size = sizeof(req);
  //property_get("ro.container.id", value, "0");
  req.id = atoi(value);
  memset(value, 0, sizeof(value));
  //property_get("ro.acg.rnode", value, "0");
  req.pad = atoi(value);
  if (_send(&req, sizeof(req)) < 0) {
    printf("%s:%d: Can't send display info request\n", __func__, __LINE__);
    return -1;
  }
  return 0;
}

int RemoteDisplay::createBuffer(gbm_import_fd_data* buffer) {
  printf("RemoteDisplay(%d)::%s\n", mSocketFd, __func__);
  gbm_import_fd_data fdData = *buffer;/*{.fd     = handle->fds[0],
                               .width  = handle->width,
                               .height = handle->height,
                               .stride = handle->strides[0],
                               .format = handle->format};*/
  buffer_info_event_t ev;
  memset(&ev, 0, sizeof(ev));
  ev.event.type = DD_EVENT_CREATE_BUFFER;
  ev.info.bufferId = (int64_t)buffer;
  ev.event.size = sizeof(ev) + sizeof(gbm_import_fd_data);

  if (_send(&(ev.event), sizeof(ev.event)) < 0) {
    printf("RemoteDisplay(%d) failed to send create buffer event\n", mSocketFd);
    return -1;
  }
  if (_send(&(ev.info), sizeof(ev.info)) < 0) {
    printf("RemoteDisplay(%d) failed to send create buffer event info\n",
          mSocketFd);
    return -1;
  }
  if (_send(&fdData, sizeof(gbm_import_fd_data))) {
    printf("RemoteDisplay(%d) failed to send create buffer event\n", mSocketFd);
    return -1;
  }
  //if (buffer->numFds > 0) {
    if (_sendFds((int*)(buffer), 1) < 0) {
      printf("RemoteDisplay(%d) failed to send create buffer event\n", mSocketFd);
      return -1;
    }
  //}
  return 0;
}

int RemoteDisplay::removeBuffer(gbm_import_fd_data* buffer) {
  printf("RemoteDisplay(%d)::%s\n", mSocketFd, __func__);
  buffer_info_event_t ev;

  memset(&ev, 0, sizeof(ev));
  ev.event.type = DD_EVENT_REMOVE_BUFFER;
  ev.info.bufferId = (int64_t)buffer;
  ev.event.size = sizeof(ev);

  if (_send(&(ev.event), sizeof(ev.event)) < 0) {
    printf("RemoteDisplay(%d) failed to send remove buffer event\n", mSocketFd);
    return -1;
  }
  if (_send(&(ev.info), sizeof(ev.info)) < 0) {
    printf("RemoteDisplay(%d) failed to send remove buffer event info\n",
          mSocketFd);
    return -1;
  }
  return 0;
}

int RemoteDisplay::displayBuffer(gbm_import_fd_data* buffer) {
  buffer_info_event_t ev;

  memset(&ev, 0, sizeof(ev));
  ev.event.type = DD_EVENT_DISPLAY_REQ;
  ev.event.size = sizeof(ev);
  ev.info.bufferId = (int64_t)buffer;

  if (_send(&ev, sizeof(ev)) < 0) {
    printf("RemoteDisplay(%d) failed to send display buffer request\n", mSocketFd);
    return -1;
  }
  return 0;
}

int RemoteDisplay::setRotation(int rotation) {
  rotation_event_t ev;

  memset(&ev, 0, sizeof(ev));
  ev.event.type = DD_EVENT_SET_ROTATION;
  ev.event.size = sizeof(ev);
  ev.rotation = rotation;

  if (_send(&ev, sizeof(ev)) < 0) {
    printf("RemoteDisplay(%d) failed to send display rotation request\n", mSocketFd);
    return -1;
  }
  return 0;
}

int RemoteDisplay::createLayer(uint64_t id) {
  create_layer_event_t ev;

  memset(&ev, 0, sizeof(ev));
  ev.event.type = DD_EVENT_CREATE_LAYER;
  ev.event.size = sizeof(ev);
  ev.layerId = id;

  if (_send(&(ev), sizeof(ev)) < 0) {
    printf("RemoteDisplay(%d) failed to send create layer event\n", mSocketFd);
    return -1;
  }

  return 0;
}

int RemoteDisplay::removeLayer(uint64_t id) {
  remove_layer_event_t ev;

  memset(&ev, 0, sizeof(ev));
  ev.event.type = DD_EVENT_REMOVE_LAYER;
  ev.event.size = sizeof(ev);
  ev.layerId = id;

  if (_send(&(ev), sizeof(ev)) < 0) {
    printf("RemoteDisplay(%d) failed to send remove layer event\n", mSocketFd);
    return -1;
  }

  return 0;
}

int RemoteDisplay::updateLayers(std::vector<layer_info_t>& layerInfo) {
  update_layers_event_t ev;
  uint32_t numLayers = 0;
  layer_info_t* layers = nullptr;

  numLayers = layerInfo.size();
  if (numLayers) {
    layers = (layer_info_t*)malloc(sizeof(layer_info_t) * numLayers);
    if (!layers) {
      printf("Failed to alloc layer info, out of memory");
      return -1;
    }
    LAYER_TRACE("%s layer count %d\n", __func__, numLayers);
    for (uint32_t i = 0; i < numLayers; i++) {
      layers[i] = layerInfo[i];
      LAYER_TRACE("  %d layer %" PRIx64 " stack %d task %d\n", i,
                  layers[i].layerId, layers[i].stackId, layers[i].taskId);
    }
  }

  ev.event.type = DD_EVENT_UPDATE_LAYERS;
  ev.event.size = sizeof(ev) + sizeof(layer_info_t) * numLayers;
  ev.numLayers = numLayers;

  if (_send(&(ev), sizeof(ev)) < 0) {
    printf("RemoteDisplay(%d) failed to send update layers event\n", mSocketFd);
    if (layers) {
      free(layers);
    }
    return -1;
  }

  if (_send(layers, sizeof(layer_info_t) * numLayers) < 0) {
    printf("RemoteDisplay(%d) failed to send update layers info\n", mSocketFd);
    if (layers) {
      free(layers);
    }
    return -1;
  }

  if (layers) {
    free(layers);
  }
  return 0;
}

int RemoteDisplay::presentLayers(
    std::vector<layer_buffer_info_t>& layerBuffer) {
  present_layers_req_event_t ev;
  uint32_t numLayers = 0;
  layer_buffer_info_t* layers = nullptr;

  numLayers = layerBuffer.size();
  if (numLayers) {
    layers =
        (layer_buffer_info_t*)malloc(sizeof(layer_buffer_info_t) * numLayers);
    if (!layers) {
      printf("Failed to alloc present req layer buffer info, out of memory");
      return -1;
    }
    for (uint32_t i = 0; i < numLayers; i++) {
      layers[i] = layerBuffer[i];
    }
  }

  ev.event.type = DD_EVENT_PRESENT_LAYERS_REQ;
  ev.event.size = sizeof(ev) + sizeof(layer_buffer_info_t) * numLayers;
  ev.numLayers = numLayers;

  if (_send(&(ev), sizeof(ev)) < 0) {
    printf("RemoteDisplay(%d) failed to send present layers req event\n",
          mSocketFd);
    if (layers) {
      free(layers);
    }
    return -1;
  }

  if (_send(layers, sizeof(layer_buffer_info_t) * numLayers) < 0) {
    printf("RemoteDisplay(%d) failed to send present layers info\n", mSocketFd);
    if (layers) {
      free(layers);
    }
    return -1;
  }
  // TODO: send layers' acqureFences
  if (layers) {
    free(layers);
  }

  return 0;
}

int RemoteDisplay::onDisplayInfoAck(const display_event_t& ev) {
  display_info_t info;
  int ret = _recv(&info, sizeof(info));
  if (ret < 0) {
    printf("%s:%d: Can't send display info request\n\n", __func__, __LINE__);
    return -1;
  }
  mWidth = info.width;
  mHeight = info.height;
  mFramerate = info.fps;
  mXDpi = info.xdpi;
  mYDpi = info.ydpi;
  mDisplayFlags.value = info.flags;

  if (mStatusListener) {
    mStatusListener->onConnect(mSocketFd);
  }
  return 0;
}

int RemoteDisplay::onDisplayBufferAck(const display_event_t& ev) {
  buffer_info_t info;
  int ret = _recv(&info, sizeof(info));
  if (ret < 0) {
    printf("RemoteDisplay(%d) failed to receive present ack\n", mSocketFd);
    return -1;
  }
  if (mEventListener) {
    mEventListener->onBufferDisplayed(info);
  }
  return 0;
}

int RemoteDisplay::onPresentLayersAck(const display_event_t& ev) {
  present_layers_ack_event_t ack;

  if (_recv(&ack.flags, sizeof(ack) - sizeof(ev)) < 0) {
    printf("RemoteDisplay(%d) failed to receive present layers ack event\n",
          mSocketFd);
    return -1;
  }
  mDisplayFlags.value = ack.flags;

  std::vector<layer_buffer_info_t> layerBuffers;
  layerBuffers.resize(ack.numLayers);
  for (size_t i = 0; i < ack.numLayers; i++) {
    if (_recv(&layerBuffers.at(i), sizeof(layer_buffer_info_t)) < 0) {
      printf("Failed to recv presemt layer(%zd) ack\n", i);
      return -1;
    }
  }
  if (mEventListener) {
    mEventListener->onPresented(layerBuffers, ack.releaseFence);
  }

  return 0;
}

int RemoteDisplay::onDisplayEvent() {
  display_event_t ev;
  int ret = _recv(&ev, sizeof(ev));
  if (ret < 0) {
    return -1;
  }

  switch (ev.type) {
    case DD_EVENT_DISPINFO_ACK:
      onDisplayInfoAck(ev);
      break;
    case DD_EVENT_DISPLAY_ACK:
      onDisplayBufferAck(ev);
      break;
    case DD_EVENT_PRESENT_LAYERS_ACK:
      onPresentLayersAck(ev);
      break;
    default: {
      char buf[1024];
      ret = _recv(buf, 1024);
      printf("Unknown command type %d expect %d recv=%d\n\n", ev.type,
             (int)(ev.size - sizeof(ev)), ret);
      break;
    }
  }

  return 0;
}

#ifndef __REMOTE_DISPLAY_H__
#define __REMOTE_DISPLAY_H__

#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>
#include <vector>

#include "IRemoteDevice.h"
#include "display_protocol.h"

class RemoteDisplay {
 public:
  RemoteDisplay(int fd);
  virtual ~RemoteDisplay();

  int width() const { return mWidth; }
  int height() const { return mHeight; }
  int fps() const { return mFramerate; }
  int xdpi() const { return mXDpi; }
  int ydpi() const { return mYDpi; }
  uint32_t flags() const { return mDisplayFlags.value; }

  uint64_t getDisplayId() const { return mDisplayId; }
  void setDisplayId(uint64_t id) { mDisplayId = id; }
  int setDisplayStatusListener(DisplayStatusListener* listener) {
    mStatusListener = listener;
    return 0;
  }

  int setDisplayEventListener(DisplayEventListener* listener) {
    mEventListener = listener;
    return 0;
  }

  // requests sent to remote
  int getConfigs();
  int createBuffer(gbm_import_fd_data* buffer);
  int removeBuffer(gbm_import_fd_data* buffer);
  int displayBuffer(gbm_import_fd_data* buffer);
  int setRotation(int rotation);
  int createLayer(uint64_t id);
  int removeLayer(uint64_t id);
  int updateLayers(std::vector<layer_info_t>& layerInfo);
  int presentLayers(std::vector<layer_buffer_info_t>& layerBuffer);

  // events from remote
  int onDisplayEvent();

 private:
  int _send(const void* buf, size_t n);
  int _recv(void* buf, size_t n);
  int _sendFds(int* pfd, size_t fdlen);
  int onDisplayInfoAck(const display_event_t& ev);
  int onDisplayBufferAck(const display_event_t& ev);
  int onPresentLayersAck(const display_event_t& ev);

 private:
  bool mDisconnected = false;
  uint64_t mDisplayId = 0;
  int mSocketFd = -1;
  DisplayStatusListener* mStatusListener = nullptr;
  DisplayEventListener* mEventListener = nullptr;

  uint32_t mWidth;
  uint32_t mHeight;
  uint32_t mFramerate;
  uint32_t mXDpi;
  uint32_t mYDpi;

  display_flags mDisplayFlags;
};

#endif  // __REMOTE_DISPLAY_H__

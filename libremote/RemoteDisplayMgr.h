#ifndef __REMOTE_DISPLAY_MGR_H__
#define __REMOTE_DISPLAY_MGR_H__

#include <condition_variable>
#include <fcntl.h>
#include <unistd.h>
#include <map>
#include <mutex>
#include <thread>
#include <vector>

#include "IRemoteDevice.h"
#include "RemoteDisplay.h"

class RemoteDisplayMgr : public IRemoteDevice,
                         public DisplayStatusListener {
 public:
  RemoteDisplayMgr();
  ~RemoteDisplayMgr();

  int init();
  // hwc as client, legacy to compatible mdc
  int connectToRemote();
  int disconnectToRemote();

  // DisplayStatusListener
  int onConnect(int fd) override;
  int onDisconnect(int fd) override;

  // IRemoteDevice
  int addRemoteDisplay(RemoteDisplay* rd) override;
  int removeRemoteDisplay(RemoteDisplay* rd) override;
  int getMaxRemoteDisplayCount() override;
  int getRemoteDisplayCount() override;

  int32_t mWidth = 1280;
  int32_t mHeight = 720;
  int32_t mFramerate = 60;
  int32_t mXDpi = 240;
  int32_t mYDpi = 240;

  // remote display
  RemoteDisplay* mRemoteDisplay = nullptr;
  uint32_t mVersion = 0;
  uint32_t mMode = 0;

  int attach(RemoteDisplay* rd);
  int detach(RemoteDisplay* rd);

  gbm_import_fd_data* mFbTarget = nullptr;
  std::vector<gbm_import_fd_data*> mFbtBuffers;

  int setClientTarget(gbm_import_fd_data* target);
  int present();


 private:
  int addRemoteDisplay(int fd);
  int removeRemoteDisplay(int fd);
  void socketThreadProc();
  void workerThreadProc();

  int setNonblocking(int fd);
  int addEpollFd(int fd);
  int delEpollFd(int fd);

  const char* kClientSock = "/ipc/display-sock";

  static uint64_t sNextId;
  std::unique_ptr<IRemoteDevice> mHwcDevice;
  int mClientFd = -1;
  std::mutex mConnectionMutex;
  std::condition_variable mClientConnected;

  std::thread* mSocketThread;
  int mServerFd = -1;
  int mMaxConnections = 2;

  std::vector<int> mPendingRemoveDisplays;
  std::mutex mWorkerMutex;
  int mWorkerEventReadPipeFd = -1;
  int mWorkerEventWritePipeFd = -1;

  std::map<int, RemoteDisplay> mRemoteDisplays;
  static const int kMaxEvents = 10;
  int mEpollFd = -1;
};
#endif  //__REMOTE_DISPLAY_MGR_H__

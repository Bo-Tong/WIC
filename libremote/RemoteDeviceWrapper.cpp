#include "RemoteDeviceWrapper.h"
#include "RemoteDisplayMgr.h"

remote_device_t remoteDeviceInit() {
    RemoteDisplayMgr* RemoteDispMgr = new RemoteDisplayMgr();
    RemoteDispMgr->init();
    return RemoteDispMgr;
}

int setClientTarget(remote_device_t remoteDev, struct gbm_import_fd_data* target) {
    RemoteDisplayMgr* RemoteDispMgr = static_cast<RemoteDisplayMgr*>(remoteDev);
    RemoteDispMgr->setClientTarget(target);
    return 0;
}

int present(remote_device_t remoteDev) {
    RemoteDisplayMgr* RemoteDispMgr = static_cast<RemoteDisplayMgr*>(remoteDev);
    RemoteDispMgr->present();
    return 0;
}

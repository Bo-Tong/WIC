#include "gbm.h"

typedef void* remote_device_t;

#ifdef __cplusplus
extern "C" {
#endif

remote_device_t remoteDeviceInit();
int setClientTarget(remote_device_t remoteDev, struct gbm_import_fd_data* target);
int present(remote_device_t remoteDev);

#ifdef __cplusplus
}
#endif

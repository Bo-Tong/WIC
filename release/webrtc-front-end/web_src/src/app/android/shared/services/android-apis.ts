import { androidHost, backendHost, websocketHost } from '../../../core/shared/services/shared-apis';

const android = `${androidHost}/android`;

export const REQUEST_URL = `${android}/requests/add`;
export const GET_IMAGES_LIST = `${android}/images/list`;
export const APP_UPLOAD = `${backendHost}/upload`;
export const APP_INSTALL = `${backendHost}/install`;
export const FILE_EXPLORER = `${backendHost}/explorer`;
export const DOWNLOAD = `${backendHost}/download`;
export const INIT = `${backendHost}/init`;
export const SHELL = `${websocketHost}/shell`;
export const STREAMER_LOG = `${websocketHost}/streamerlog`;
export const ANDROID_LOG = `${websocketHost}/androidlog`;
export const LOG_CAT = `${websocketHost}/logcat`;
export const P2P_STATUS = `${android}/instances/p2p_status`;
export const TEST_LIST = `${androidHost}/test/images/list`;
export const TEST_REQUEST = `${androidHost}/test/requests/add`;
export const TEST_LOG = `${websocketHost}/testlog`;
export const SOCKET_CLOSE = `${backendHost}/close`;

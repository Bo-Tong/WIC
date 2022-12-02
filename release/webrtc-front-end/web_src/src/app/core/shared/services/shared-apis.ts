export const androidHost = `http://${process.env.REACT_APP_BACKEND_HOST}:30009`;
export const backendHost = `http://${process.env.REACT_APP_BACKEND_HOST}:30007`;
export const websocketHost = `ws://${process.env.REACT_APP_BACKEND_HOST}:30007`;

export const USER_ENROLL = `${backendHost}/register`;
export const USER_LOGIN = `${backendHost}/login`;
export const CHECK_USERNAME = `${backendHost}/check`;

import { USER_EXPIRED, USER_LOAD_ERROR, USER_LOADED, USER_LOGGING, USER_LOGOUT } from '../../shared/models/action-types';
import { UserResponse } from '../../shared/models/user';

interface UserLogging {
  type: typeof USER_LOGGING;
}

interface UserLoaded {
  type: typeof USER_LOADED;
  profile: UserResponse;
}

interface UserExpired {
  type: typeof USER_EXPIRED;
}

interface UserLoadError {
  type: typeof USER_LOAD_ERROR;
  errorMsg?: string;
}

interface UserLogout {
  type: typeof USER_LOGOUT;
}

export const userLogging = (): UserActions => ({
  type: USER_LOGGING
});

export const userLoaded = (profile: UserResponse): UserActions => ({
  type: USER_LOADED,
  profile
});

export const userExpired = (): UserActions => ({
  type: USER_EXPIRED
});

export const userLogout = (): UserActions => ({
  type: USER_LOGOUT
});

export const userLoadError = (errorMsg?: string): UserActions => ({
  type: USER_LOAD_ERROR,
  errorMsg
});

export type UserActions = UserLogging | UserLoaded | UserLoadError | UserExpired | UserLogout;

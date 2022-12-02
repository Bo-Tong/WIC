import { USER_EXPIRED, USER_LOAD_ERROR, USER_LOADED, USER_LOGGING, USER_LOGOUT } from '../../shared/models/action-types';
import { UserResponse } from '../../shared/models/user';

import { UserActions } from './user-actions';

export interface UserState {
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  profile?: UserResponse;
  errorMsg?: string;
}

const initialState: UserState = {
  isLoggedIn: false,
  isLoggingIn: false,
  profile: undefined,
  errorMsg: undefined
};

export function userReducer(state: UserState = initialState, action: UserActions): UserState {
  switch (action.type) {
    case USER_LOGGING:
      return {
        ...state,
        isLoggingIn: true,
        errorMsg: undefined
      };
    case USER_LOADED:
      return {
        ...state,
        isLoggingIn: false,
        isLoggedIn: true,
        profile: action.profile,
        errorMsg: undefined
      };
    case USER_LOAD_ERROR:
      return {
        ...state,
        isLoggingIn: false,
        errorMsg: action.errorMsg
      };
    case USER_EXPIRED:
      return {
        ...state,
        isLoggedIn: false
      };
    case USER_LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
        profile: undefined
      };
    default:
      return state;
  }
}

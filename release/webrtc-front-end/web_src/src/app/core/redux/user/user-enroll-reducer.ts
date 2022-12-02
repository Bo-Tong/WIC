import { USER_ENROLL_FAIL, USER_ENROLL_SUCCESS, USER_ENROLLING } from '../../shared/models/action-types';

import { UserEnrollActions } from './user-enroll-actions';

export interface UserEnrollState {
  isLoading: boolean;
  errorMsg?: string;
  isSuccess: boolean;
}

export const initialUserEnrollState: UserEnrollState = {
  isLoading: false,
  errorMsg: undefined,
  isSuccess: false
};

export function userEnrollReducer(state: UserEnrollState = initialUserEnrollState, action: UserEnrollActions): UserEnrollState {
  switch (action.type) {
    case USER_ENROLLING:
      return {
        ...state,
        isLoading: true,
        errorMsg: undefined
      };
    case USER_ENROLL_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isSuccess: true
      };
    case USER_ENROLL_FAIL:
      return {
        ...state,
        isLoading: false,
        errorMsg: action.errorMsg
      };
    default:
      return state;
  }
}

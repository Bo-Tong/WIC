import { USER_ENROLL_FAIL, USER_ENROLL_SUCCESS, USER_ENROLLING } from '../../shared/models/action-types';

interface UserEnrolling {
  type: typeof USER_ENROLLING;
}

interface UserEnrollSuccess {
  type: typeof USER_ENROLL_SUCCESS;
}

interface UserEnrollFail {
  type: typeof USER_ENROLL_FAIL;
  errorMsg?: string;
}

export const userEnrolling = (): UserEnrollActions => ({
  type: USER_ENROLLING
});

export const userEnrollSuccess = (): UserEnrollActions => ({
  type: USER_ENROLL_SUCCESS
});

export const userEnrollFail = (errorMsg?: string): UserEnrollActions => ({
  type: USER_ENROLL_FAIL,
  errorMsg
});

export type UserEnrollActions = UserEnrolling | UserEnrollSuccess | UserEnrollFail;

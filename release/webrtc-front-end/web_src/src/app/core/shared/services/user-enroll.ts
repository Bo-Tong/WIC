import axios from 'axios';
import { useReducer } from 'react';

import { userEnrolling, userEnrollFail, userEnrollSuccess } from '../../redux/user/user-enroll-actions';
import { initialUserEnrollState, userEnrollReducer, UserEnrollState } from '../../redux/user/user-enroll-reducer';
import { HttpStatusCode } from '../models/http-status-code';
import { sysMsg } from '../models/msg';
import { UserModel } from '../models/user';

import { USER_ENROLL } from './shared-apis';

export const useEnrollApi = (): [UserEnrollState, (formData: UserModel) => Promise<void>] => {
  const [state, dispatch] = useReducer(userEnrollReducer, initialUserEnrollState);

  const enroll = async (formData: UserModel): Promise<void> => {
    dispatch(userEnrolling());

    try {
      await axios(USER_ENROLL, { method: 'POST', data: formData })
        .then((result): void => {
          switch (result.status) {
            case HttpStatusCode.Ok:
              dispatch(userEnrollSuccess());
              break;
            case HttpStatusCode.BadRequest:
              dispatch(userEnrollFail(result.data.message));
              break;
            default:
              dispatch(userEnrollFail(result.data.message));
          }
        })
        .catch((error): void => dispatch(userEnrollFail(sysMsg.baseMsg.Unexpected)));
    } catch (error) {
      dispatch(userEnrollFail(sysMsg.baseMsg.ServiceError));
    }
  };

  return [state, enroll];
};

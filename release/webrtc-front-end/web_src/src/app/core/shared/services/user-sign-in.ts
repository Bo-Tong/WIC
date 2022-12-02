import axios from 'axios';

import { userLoaded, userLoadError, userLogging, UserActions } from '../../redux/user/user-actions';
import { HttpStatusCode } from '../models/http-status-code';
import { sysMsg } from '../models/msg';
import { UserModel } from '../models/user';

import { USER_LOGIN } from './shared-apis';
import { store } from './store';

export const useSignIn = (formData: UserModel): void => {
  if (!Object.values(formData).every((v): boolean => !!v)) {
    store.dispatch(userLoadError(sysMsg.userMsg.NoMatchUser));
    return;
  }

  const signIn = async (): Promise<void> => {
    store.dispatch(userLogging());

    try {
      await axios(USER_LOGIN, { method: 'POST', data: formData })
        .then((result): void => {
          switch (result.status) {
            case HttpStatusCode.Ok:
              if (!result.data.username) {
                store.dispatch(userLoadError(sysMsg.userMsg.NoMatchUser));
              } else {
                store.dispatch(userLoaded({ id: result.data.id, username: result.data.username }));
                const curDate = new Date().getTime();
                document.cookie = JSON.stringify({ username: result.data.username, storeTime: curDate });
              }
              break;
            case HttpStatusCode.BadRequest:
              store.dispatch(userLoadError(result.data.message));
              break;
            default:
              store.dispatch(userLoadError(result.data.message));
          }
        })
        .catch((error): UserActions => store.dispatch(userLoadError(sysMsg.baseMsg.Unexpected)));
    } catch (error) {
      store.dispatch(userLoadError(sysMsg.baseMsg.ServiceError));
    }
  };

  signIn();
};

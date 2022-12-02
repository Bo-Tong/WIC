import axios from 'axios';
import { useEffect, useReducer } from 'react';

import { HttpStatusCode } from '../../../core/shared/models/http-status-code';
import { sysMsg } from '../../../core/shared/models/msg';
import { requestLoaded, requestLoading, requestLoadFail } from '../redux/request-actions';
import { initialRequestState, RequestReducer, RequestState } from '../redux/request-reducer';

import { REQUEST_URL } from './android-apis';

export const useRequestUrlApi = (insId: string, version: string): RequestState => {
  const [state, dispatch] = useReducer(RequestReducer, initialRequestState);

  useEffect((): void | (() => void | undefined) => {
    let unmounted = false;
    const source = axios.CancelToken.source();

    dispatch(requestLoading());

    const requestUrl = async (): Promise<void> => {
      try {
        await axios(`${REQUEST_URL}/${insId}?version=${version}`, { cancelToken: source.token })
          .then((result): void => {
            if (!unmounted) {
              switch (result.status) {
                case HttpStatusCode.Ok:
                  dispatch(requestLoaded(result.data.trim()));
                  break;
                case HttpStatusCode.BadRequest:
                  dispatch(requestLoadFail(result.data));
                  break;
                default:
                  dispatch(requestLoadFail(result.data));
              }
            }
          })
          .catch((error): void => {
            if (!unmounted) {
              dispatch(requestLoadFail(sysMsg.baseMsg.Unexpected));
            }
          });
      } catch (error) {
        if (!unmounted) {
          if (!axios.isCancel(error)) {
            throw error;
          }
        }
      }
    };

    requestUrl();

    return (): void => {
      unmounted = true;
      source.cancel();
    };
  }, [insId, version]);

  return state;
};

import axios from 'axios';
import { useEffect, useReducer } from 'react';

import { HttpStatusCode } from '../../../core/shared/models/http-status-code';
import { sysMsg } from '../../../core/shared/models/msg';
import { tabData, TabDataModel } from '../models/shared-data';
import { initLoaded, initLoading, initLoadFail } from '../redux/init-actions';
import { initialInitState, InitReducer, InitState } from '../redux/init-reducer';

import { INIT } from './android-apis';

export const useInitADB = (id: string, version: string, s: Function, p: boolean): InitState => {
  const [state, dispatch] = useReducer(InitReducer, initialInitState);

  useEffect((): void | (() => void | undefined) => {
    let unmounted = false;
    const source = axios.CancelToken.source();

    const initADB = async (): Promise<void> => {
      dispatch(initLoading());

      try {
        await axios(INIT, { params: { id, version }, cancelToken: source.token })
          .then((result): void => {
            if (!unmounted) {
              switch (result.status) {
                case HttpStatusCode.Ok:
                  dispatch(initLoaded(result.status));
                  if (p) {
                    s((d: TabDataModel[]): TabDataModel[] => [...d, ...tabData]);
                  }
                  break;
                case HttpStatusCode.BadRequest:
                  dispatch(initLoadFail(sysMsg.baseMsg.Unexpected));
                  break;
                default:
                  dispatch(initLoadFail(sysMsg.baseMsg.Unexpected));
              }
            }
          })
          .catch((error): void => {
            if (!unmounted) {
              dispatch(initLoadFail(sysMsg.baseMsg.Unexpected));
            }
          });
      } catch (error) {
        if (!unmounted) {
          if (axios.isCancel(error)) {
            dispatch(initLoadFail(sysMsg.baseMsg.ServiceError));
          } else {
            throw error;
          }
        }
      }
    };

    initADB();

    return (): void => {
      unmounted = true;
      source.cancel();
    };
  }, [id, p, s, version]);

  return state;
};

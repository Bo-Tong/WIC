import axios from 'axios';
import { useEffect, useReducer } from 'react';

import { HttpStatusCode } from '../../../core/shared/models/http-status-code';
import { sysMsg } from '../../../core/shared/models/msg';
import { testRequestLoaded, testRequestLoading, testRequestLoadFail } from '../redux/test-request-actions';
import { initialTestRequestState, TestRequestReducer, TestRequestState } from '../redux/test-request-reducer';

import { TEST_REQUEST } from './android-apis';

export const useTestRequestApi = (insId: string, androidId: string, version: string): TestRequestState => {
  const [state, dispatch] = useReducer(TestRequestReducer, initialTestRequestState);

  useEffect((): void | (() => void | undefined) => {
    let unmounted = false;
    const source = axios.CancelToken.source();

    dispatch(testRequestLoading());

    const testRequest = async (): Promise<void> => {
      try {
        await axios(`${TEST_REQUEST}/${insId}?androidId=${androidId}&version=${version}`, { cancelToken: source.token })
          .then((result): void => {
            if (!unmounted) {
              switch (result.status) {
                case HttpStatusCode.Ok:
                  dispatch(testRequestLoaded(result.data.trim()));
                  break;
                case HttpStatusCode.BadRequest:
                  dispatch(testRequestLoadFail(result.data));
                  break;
                default:
                  dispatch(testRequestLoadFail(result.data));
              }
            }
          })
          .catch((error): void => {
            if (!unmounted) {
              dispatch(testRequestLoadFail(sysMsg.baseMsg.Unexpected));
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

    testRequest();

    return (): void => {
      unmounted = true;
      source.cancel();
    };
  }, [androidId, insId, version]);

  return state;
};

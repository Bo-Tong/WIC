import axios from 'axios';
import { useEffect, useReducer } from 'react';

import { HttpStatusCode } from '../../../core/shared/models/http-status-code';
import { sysMsg } from '../../../core/shared/models/msg';
import { testListLoaded, testListLoading, testListLoadFail } from '../redux/test-list-actions';
import { initialTestListState, TestListReducer, TestListState } from '../redux/test-list-reducer';

import { TEST_LIST } from './android-apis';

export const useTestImageListApi = (): TestListState => {
  const [state, dispatch] = useReducer(TestListReducer, initialTestListState);

  useEffect((): void | (() => void | undefined) => {
    let unmounted = false;
    const source = axios.CancelToken.source();

    const testImageList = async (): Promise<void> => {
      dispatch(testListLoading());

      try {
        await axios(TEST_LIST, { cancelToken: source.token })
          .then((result): void => {
            if (!unmounted) {
              switch (result.status) {
                case HttpStatusCode.Ok:
                  dispatch(testListLoaded(result.data));
                  break;
                case HttpStatusCode.BadRequest:
                  dispatch(testListLoadFail(result.data.msg));
                  break;
                default:
                  dispatch(testListLoadFail(result.data.msg));
              }
            }
          })
          .catch((error): void => {
            if (!unmounted) {
              dispatch(testListLoadFail(sysMsg.baseMsg.Unexpected));
            }
          });
      } catch (error) {
        if (!unmounted) {
          if (axios.isCancel(error)) {
            dispatch(testListLoadFail(sysMsg.baseMsg.ServiceError));
          } else {
            throw error;
          }
        }
      }
    };

    testImageList();

    return (): void => {
      unmounted = true;
      source.cancel();
    };
  }, []);

  return state;
};

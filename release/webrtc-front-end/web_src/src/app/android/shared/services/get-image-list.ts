import axios from 'axios';
import { useEffect, useReducer } from 'react';

import { HttpStatusCode } from '../../../core/shared/models/http-status-code';
import { sysMsg } from '../../../core/shared/models/msg';
import { androidListLoaded, androidListLoading, androidListLoadFail } from '../redux/android-list-actions';
import { initialAndroidListState, AndroidListReducer, AndroidListState } from '../redux/android-list-reducer';

import { GET_IMAGES_LIST } from './android-apis';

export const useGetImageListApi = (): AndroidListState => {
  const [state, dispatch] = useReducer(AndroidListReducer, initialAndroidListState);

  useEffect((): void | (() => void | undefined) => {
    let unmounted = false;
    const source = axios.CancelToken.source();

    const getImageList = async (): Promise<void> => {
      dispatch(androidListLoading());

      try {
        await axios(GET_IMAGES_LIST, { cancelToken: source.token })
          .then((result): void => {
            if (!unmounted) {
              switch (result.status) {
                case HttpStatusCode.Ok:
                  dispatch(androidListLoaded(result.data));
                  break;
                case HttpStatusCode.BadRequest:
                  dispatch(androidListLoadFail(result.data.msg));
                  break;
                default:
                  dispatch(androidListLoadFail(result.data.msg));
              }
            }
          })
          .catch((error): void => {
            if (!unmounted) {
              dispatch(androidListLoadFail(sysMsg.baseMsg.Unexpected));
            }
          });
      } catch (error) {
        if (!unmounted) {
          if (axios.isCancel(error)) {
            dispatch(androidListLoadFail(sysMsg.baseMsg.ServiceError));
          } else {
            throw error;
          }
        }
      }
    };

    getImageList();

    return (): void => {
      unmounted = true;
      source.cancel();
    };
  }, []);

  return state;
};

import axios from 'axios';
import { useEffect, useReducer } from 'react';

import { HttpStatusCode } from '../../../core/shared/models/http-status-code';
import { sysMsg } from '../../../core/shared/models/msg';
import { fileExplorerLoaded, fileExplorerLoading, fileExplorerLoadFail } from '../redux/file-explorer-action';
import { initialFileExplorerState, FileExplorerReducer, FileExplorerState } from '../redux/file-explorer-reducer';

import { FILE_EXPLORER } from './android-apis';

export const useFileExplorerApi = (id: string, version: string | null, path?: string): FileExplorerState => {
  const [state, dispatch] = useReducer(FileExplorerReducer, initialFileExplorerState);

  useEffect((): void | (() => void | undefined) => {
    let unmounted = false;
    const source = axios.CancelToken.source();

    const fileExplorer = async (): Promise<void> => {
      dispatch(fileExplorerLoading());

      try {
        await axios(FILE_EXPLORER, { params: { id, version, path }, cancelToken: source.token })
          .then((result): void => {
            if (!unmounted) {
              switch (result.status) {
                case HttpStatusCode.Ok:
                  dispatch(fileExplorerLoaded(result.data));
                  break;
                case HttpStatusCode.BadRequest:
                  dispatch(fileExplorerLoadFail(result.statusText));
                  break;
                default:
                  dispatch(fileExplorerLoadFail(result.statusText));
              }
            }
          })
          .catch((error): void => {
            if (!unmounted) {
              dispatch(fileExplorerLoadFail(sysMsg.baseMsg.Unexpected));
            }
          });
      } catch (error) {
        if (!unmounted) {
          if (axios.isCancel(error)) {
            dispatch(fileExplorerLoadFail(sysMsg.baseMsg.ServiceError));
          } else {
            throw error;
          }
        }
      }
    };

    fileExplorer();

    return (): void => {
      unmounted = true;
      source.cancel();
    };
  }, [id, path, version]);

  return state;
};

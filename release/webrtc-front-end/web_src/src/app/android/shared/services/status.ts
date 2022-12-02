import axios from 'axios';
import { useEffect } from 'react';

import { P2P_STATUS } from './android-apis';

export const useStatusApi = (id: string, version: string): null => {
  useEffect((): void | (() => void | undefined) => {
    let unmounted = false;
    const source = axios.CancelToken.source();

    const status = async (): Promise<void> => {
      try {
        if (!unmounted) {
          await axios(P2P_STATUS, { params: { id, version, status: 'occupied' }, cancelToken: source.token }).catch((error): void => {});
        }
      } catch (error) {
        if (!unmounted) {
          if (!axios.isCancel(error)) {
            throw error;
          }
        }
      }
    };

    status();

    return (): void => {
      unmounted = true;
      source.cancel();
    };
  }, [id, version]);

  return null;
};

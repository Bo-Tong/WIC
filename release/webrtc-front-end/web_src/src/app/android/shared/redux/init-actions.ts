import { INIT_LOAD_FAIL, INIT_LOADED, INIT_LOADING } from '../models/action-types';

interface InitLoading {
  type: typeof INIT_LOADING;
}

interface InitLoaded {
  type: typeof INIT_LOADED;
  status?: number;
}

interface InitLoadFail {
  type: typeof INIT_LOAD_FAIL;
  errorMsg: string;
}

export const initLoading = (): InitActions => ({
  type: INIT_LOADING
});

export const initLoaded = (status?: number): InitActions => ({
  type: INIT_LOADED,
  status
});

export const initLoadFail = (errorMsg: string): InitActions => ({
  type: INIT_LOAD_FAIL,
  errorMsg
});

export type InitActions = InitLoading | InitLoaded | InitLoadFail;

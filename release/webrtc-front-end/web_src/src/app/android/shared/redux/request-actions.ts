import { REQUEST_URL_LOAD_FAIL, REQUEST_URL_LOADED, REQUEST_URL_LOADING } from '../models/action-types';

interface RequestLoading {
  type: typeof REQUEST_URL_LOADING;
}

interface RequestLoaded {
  type: typeof REQUEST_URL_LOADED;
  data: string;
}

interface RequestLoadFail {
  type: typeof REQUEST_URL_LOAD_FAIL;
  errorMsg: string;
}

export const requestLoading = (): RequestActions => ({
  type: REQUEST_URL_LOADING
});

export const requestLoaded = (data: string): RequestActions => ({
  type: REQUEST_URL_LOADED,
  data
});

export const requestLoadFail = (errorMsg: string): RequestActions => ({
  type: REQUEST_URL_LOAD_FAIL,
  errorMsg
});

export type RequestActions = RequestLoading | RequestLoaded | RequestLoadFail;

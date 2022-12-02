import { ANDROID_LIST_LOAD_FAIL, ANDROID_LIST_LOADED, ANDROID_LIST_LOADING } from '../models/action-types';
import { ImageListData } from '../models/list';

interface AndroidListLoading {
  type: typeof ANDROID_LIST_LOADING;
}

interface AndroidListLoaded {
  type: typeof ANDROID_LIST_LOADED;
  androidList: ImageListData[];
}

interface AndroidListLoadFail {
  type: typeof ANDROID_LIST_LOAD_FAIL;
  errorMsg: string;
}

export const androidListLoading = (): AndroidListActions => ({
  type: ANDROID_LIST_LOADING
});

export const androidListLoaded = (androidList: ImageListData[]): AndroidListActions => ({
  type: ANDROID_LIST_LOADED,
  androidList
});

export const androidListLoadFail = (errorMsg: string): AndroidListActions => ({
  type: ANDROID_LIST_LOAD_FAIL,
  errorMsg
});

export type AndroidListActions = AndroidListLoading | AndroidListLoaded | AndroidListLoadFail;

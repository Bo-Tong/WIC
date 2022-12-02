import { ANDROID_LIST_LOAD_FAIL, ANDROID_LIST_LOADED, ANDROID_LIST_LOADING } from '../models/action-types';
import { ImageListData } from '../models/list';

import { AndroidListActions } from './android-list-actions';

export interface AndroidListState {
  isLoading: boolean;
  androidList: ImageListData[];
  errorMsg: string;
}

export const initialAndroidListState: AndroidListState = {
  isLoading: true,
  androidList: [],
  errorMsg: ''
};

export function AndroidListReducer(state: AndroidListState = initialAndroidListState, action: AndroidListActions): AndroidListState {
  switch (action.type) {
    case ANDROID_LIST_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case ANDROID_LIST_LOADED:
      return {
        ...state,
        isLoading: false,
        androidList: action.androidList
      };
    case ANDROID_LIST_LOAD_FAIL:
      return {
        ...state,
        isLoading: false,
        androidList: [],
        errorMsg: action.errorMsg
      };
    default:
      return state;
  }
}

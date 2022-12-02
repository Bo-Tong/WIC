import { REQUEST_URL_LOAD_FAIL, REQUEST_URL_LOADED, REQUEST_URL_LOADING } from '../models/action-types';

import { RequestActions } from './request-actions';

export interface RequestState {
  isLoading: boolean;
  errorMsg: string;
  data: string;
}

export const initialRequestState: RequestState = {
  isLoading: true,
  errorMsg: '',
  data: ''
};

export function RequestReducer(state: RequestState = initialRequestState, action: RequestActions): RequestState {
  switch (action.type) {
    case REQUEST_URL_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case REQUEST_URL_LOADED:
      return {
        ...state,
        isLoading: false,
        data: action.data
      };
    case REQUEST_URL_LOAD_FAIL:
      return {
        ...state,
        isLoading: false,
        errorMsg: action.errorMsg
      };
    default:
      return state;
  }
}

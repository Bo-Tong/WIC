import { INIT_LOAD_FAIL, INIT_LOADED, INIT_LOADING } from '../models/action-types';

import { InitActions } from './init-actions';

export interface InitState {
  isLoading: boolean;
  errorMsg: string;
  status?: number;
}

export const initialInitState: InitState = {
  isLoading: true,
  errorMsg: '',
  status: undefined
};

export function InitReducer(state: InitState = initialInitState, action: InitActions): InitState {
  switch (action.type) {
    case INIT_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case INIT_LOADED:
      return {
        ...state,
        isLoading: false,
        status: action.status
      };
    case INIT_LOAD_FAIL:
      return {
        ...state,
        isLoading: false,
        errorMsg: action.errorMsg
      };
    default:
      return state;
  }
}

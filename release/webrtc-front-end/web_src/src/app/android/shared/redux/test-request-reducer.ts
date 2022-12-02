import { TEST_REQUEST_LOAD_FAIL, TEST_REQUEST_LOADED, TEST_REQUEST_LOADING } from '../models/action-types';

import { TestRequestActions } from './test-request-actions';

export interface TestRequestState {
  isLoading: boolean;
  errorMsg: string;
  data?: string;
}

export const initialTestRequestState: TestRequestState = {
  isLoading: true,
  errorMsg: '',
  data: ''
};

export function TestRequestReducer(state: TestRequestState = initialTestRequestState, action: TestRequestActions): TestRequestState {
  switch (action.type) {
    case TEST_REQUEST_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case TEST_REQUEST_LOADED:
      return {
        ...state,
        isLoading: false,
        data: action.data
      };
    case TEST_REQUEST_LOAD_FAIL:
      return {
        ...state,
        isLoading: false,
        errorMsg: action.errorMsg
      };
    default:
      return state;
  }
}

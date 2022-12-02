import { TEST_LIST_LOAD_FAIL, TEST_LIST_LOADED, TEST_LIST_LOADING } from '../models/action-types';
import { ImageListData } from '../models/list';

import { TestListActions } from './test-list-actions';

export interface TestListState {
  isLoading: boolean;
  testList: ImageListData[];
  errorMsg: string;
}

export const initialTestListState: TestListState = {
  isLoading: true,
  testList: [],
  errorMsg: ''
};

export function TestListReducer(state: TestListState = initialTestListState, action: TestListActions): TestListState {
  switch (action.type) {
    case TEST_LIST_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case TEST_LIST_LOADED:
      return {
        ...state,
        isLoading: false,
        testList: action.testList
      };
    case TEST_LIST_LOAD_FAIL:
      return {
        ...state,
        isLoading: false,
        testList: [],
        errorMsg: action.errorMsg
      };
    default:
      return state;
  }
}

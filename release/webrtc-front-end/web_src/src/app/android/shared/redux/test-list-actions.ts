import { TEST_LIST_LOAD_FAIL, TEST_LIST_LOADED, TEST_LIST_LOADING } from '../models/action-types';
import { ImageListData } from '../models/list';

interface TestListLoading {
  type: typeof TEST_LIST_LOADING;
}

interface TestListLoaded {
  type: typeof TEST_LIST_LOADED;
  testList: ImageListData[];
}

interface TestListLoadFail {
  type: typeof TEST_LIST_LOAD_FAIL;
  errorMsg: string;
}

export const testListLoading = (): TestListActions => ({
  type: TEST_LIST_LOADING
});

export const testListLoaded = (testList: ImageListData[]): TestListActions => ({
  type: TEST_LIST_LOADED,
  testList
});

export const testListLoadFail = (errorMsg: string): TestListActions => ({
  type: TEST_LIST_LOAD_FAIL,
  errorMsg
});

export type TestListActions = TestListLoading | TestListLoaded | TestListLoadFail;

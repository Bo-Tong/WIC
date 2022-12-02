import { TEST_REQUEST_LOAD_FAIL, TEST_REQUEST_LOADED, TEST_REQUEST_LOADING } from '../models/action-types';

interface TestRequestLoading {
  type: typeof TEST_REQUEST_LOADING;
}

interface TestRequestLoaded {
  type: typeof TEST_REQUEST_LOADED;
  data?: string;
}

interface TestRequestLoadFail {
  type: typeof TEST_REQUEST_LOAD_FAIL;
  errorMsg: string;
}

export const testRequestLoading = (): TestRequestActions => ({
  type: TEST_REQUEST_LOADING
});

export const testRequestLoaded = (data?: string): TestRequestActions => ({
  type: TEST_REQUEST_LOADED,
  data
});

export const testRequestLoadFail = (errorMsg: string): TestRequestActions => ({
  type: TEST_REQUEST_LOAD_FAIL,
  errorMsg
});

export type TestRequestActions = TestRequestLoading | TestRequestLoaded | TestRequestLoadFail;

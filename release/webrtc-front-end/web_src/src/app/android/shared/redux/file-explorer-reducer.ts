import { FILE_EXPLORER_LOAD_FAIL, FILE_EXPLORER_LOADED, FILE_EXPLORER_LOADING } from '../models/action-types';
import { ResData } from '../models/file-explorer';

import { FileExplorerActions } from './file-explorer-action';

export interface FileExplorerState {
  isLoading: boolean;
  fileExplorer: ResData;
  errorMsg: string;
}

export const initialFileExplorerState: FileExplorerState = {
  isLoading: true,
  fileExplorer: { files: [], directories: [], others: [] },
  errorMsg: ''
};

export function FileExplorerReducer(state: FileExplorerState = initialFileExplorerState, action: FileExplorerActions): FileExplorerState {
  switch (action.type) {
    case FILE_EXPLORER_LOADING:
      return {
        ...state,
        isLoading: true,
        errorMsg: ''
      };
    case FILE_EXPLORER_LOADED:
      return {
        ...state,
        isLoading: false,
        fileExplorer: action.fileExplorer,
        errorMsg: ''
      };
    case FILE_EXPLORER_LOAD_FAIL:
      return {
        ...state,
        isLoading: false,
        errorMsg: action.errorMsg,
        fileExplorer: { files: null, directories: null, others: null }
      };
    default:
      return state;
  }
}

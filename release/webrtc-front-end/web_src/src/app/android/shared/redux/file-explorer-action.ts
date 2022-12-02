import { FILE_EXPLORER_LOAD_FAIL, FILE_EXPLORER_LOADED, FILE_EXPLORER_LOADING } from '../models/action-types';
import { ResData } from '../models/file-explorer';

interface FileExplorerLoading {
  type: typeof FILE_EXPLORER_LOADING;
}

interface FileExplorerLoaded {
  type: typeof FILE_EXPLORER_LOADED;
  fileExplorer: ResData;
}

interface FileExplorerLoadFail {
  type: typeof FILE_EXPLORER_LOAD_FAIL;
  errorMsg: string;
}

export const fileExplorerLoading = (): FileExplorerActions => ({
  type: FILE_EXPLORER_LOADING
});

export const fileExplorerLoaded = (fileExplorer: ResData): FileExplorerActions => ({
  type: FILE_EXPLORER_LOADED,
  fileExplorer
});

export const fileExplorerLoadFail = (errorMsg: string): FileExplorerActions => ({
  type: FILE_EXPLORER_LOAD_FAIL,
  errorMsg
});

export type FileExplorerActions = FileExplorerLoading | FileExplorerLoaded | FileExplorerLoadFail;

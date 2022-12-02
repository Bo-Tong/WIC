import { CloudUploadOutlined, CodeOutlined, FileTextOutlined, FolderOpenOutlined, MenuOutlined } from '@ant-design/icons';
import { ProgressProps } from 'antd/lib/progress';
import React, { ReactElement } from 'react';

import { FileExplorer } from '../components/file-explorer';
import { Shell } from '../components/shell';
import { TestCase } from '../components/test-case';
import { CustomUpload } from '../components/upload';
import { ANDROID_LOG, LOG_CAT, SHELL, STREAMER_LOG } from '../services/android-apis';

export interface TabDataModel {
  key: string;
  text: string;
  icon: ReactElement;
  render: ReactElement;
}

export const defaultTabData: TabDataModel[] = [
  {
    key: 'tab-test-case-shell',
    text: 'Test case',
    icon: <MenuOutlined />,
    render: <TestCase />
  },
  {
    key: 'tab-android-shell',
    text: 'Android Logs',
    icon: <FileTextOutlined />,
    render: <Shell api={ANDROID_LOG} />
  },
  {
    key: 'tab-streamer-shell',
    text: 'Streamer Logs',
    icon: <FileTextOutlined />,
    render: <Shell api={STREAMER_LOG} />
  },
  {
    key: 'tab-log-cat-shell',
    text: 'Logcat',
    icon: <FileTextOutlined />,
    render: <Shell api={LOG_CAT} />
  }
];

export const tabData: TabDataModel[] = [
  {
    key: 'tab-shell',
    text: 'Shell',
    icon: <CodeOutlined />,
    render: <Shell api={SHELL} />
  },
  {
    key: 'tab-upload',
    text: 'Upload/Install',
    icon: <CloudUploadOutlined />,
    render: <CustomUpload />
  },
  {
    key: 'tab-file-explorer',
    text: 'File explorer',
    icon: <FolderOpenOutlined />,
    render: <FileExplorer />
  }
];

export const progressProps: ProgressProps = {
  showInfo: false,
  strokeColor: {
    '0%': '#108ee9',
    '100%': '#87d068'
  }
};

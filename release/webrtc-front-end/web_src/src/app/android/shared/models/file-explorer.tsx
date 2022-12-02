import { FileOutlined, FolderFilled } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import React, { Key, ReactElement } from 'react';

import { FileNameWrapper } from '../styles/panel-styles';

export interface FileExplorerModel {
  name: string;
  permission: string;
  size: string;
  date: string;
  type: string;
  key: Key;
}

export const columns = (f: Function, d: Function): ColumnsType<FileExplorerModel> => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text: string, record: FileExplorerModel): ReactElement => (
      <FileNameWrapper>
        {record.type === 'dir' ? <FolderFilled style={{ color: '#79b8ff' }} /> : <FileOutlined />}
        {record.type === 'dir' ? (
          <span onClick={(): void => f(text)}>{text}</span>
        ) : record.type === 'files' ? (
          <span onClick={(): void => d(text)}>{text}</span>
        ) : (
          text
        )}
      </FileNameWrapper>
    )
  },
  {
    title: 'Size',
    dataIndex: 'size',
    key: 'size'
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date'
  },
  {
    title: 'Permission',
    dataIndex: 'permission',
    key: 'permission'
  }
];

export const paginationProps = { defaultPageSize: 10, showSizeChanger: false, hideOnSinglePage: true };
export interface ResData {
  files: FileExplorerModel[] | null;
  directories: FileExplorerModel[] | null;
  others: FileExplorerModel[] | null;
}

export const fileExplorerDataHandle = (list: ResData): FileExplorerModel[] => {
  if (list) {
    const files = list.files ? list.files.map((item, i): FileExplorerModel => ({ ...item, key: `${i}_files`, type: 'files' })) : [];
    const dir = list.directories ? list.directories.map((item, i): FileExplorerModel => ({ ...item, key: `${i}_dir`, type: 'dir' })) : [];
    const others = list.others ? list.others.map((item, i): FileExplorerModel => ({ ...item, key: `${i}_others`, type: 'others' })) : [];

    return dir.concat(files, others);
  }
  return [];
};

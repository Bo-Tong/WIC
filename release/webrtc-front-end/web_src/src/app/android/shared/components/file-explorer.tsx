import { ArrowUpOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Table } from 'antd';
import axios from 'axios';
import React, { useState, ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { UserState } from '../../../core/redux/user/user-reducer';
import { RootStates } from '../../../core/shared/services/store';
import { columns, fileExplorerDataHandle, paginationProps } from '../models/file-explorer';
import { DOWNLOAD } from '../services/android-apis';
import { useFileExplorerApi } from '../services/file-explorer';
import { fileExplorerStyles } from '../styles/panel-styles';

import { FileBreadcrumb } from './breadcrumb';

export function FileExplorer(): ReactElement {
  const { version } = useParams<{ version: string }>();
  const user = useSelector((uState: RootStates): UserState => uState.user);
  const [path, setPath] = useState('');
  const state = useFileExplorerApi(user.profile!.id, version, path);

  const goBack = (): void => {
    setPath(path.substring(0, path.lastIndexOf('/')));
  };

  const goDir = (dir: string): void => {
    setPath(path ? `${path}/${dir}` : dir);
  };

  const goAssignationDir = (callbackPath: string): void => {
    setPath(callbackPath);
  };

  const goDownload = async (file: string): Promise<void> => {
    const url = window.URL.createObjectURL(
      new Blob(['\uFEFF' + (await axios(DOWNLOAD, { params: { path, filename: file, id: user.profile!.id, version } })).data])
    );
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', `${file}`);
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
  };

  const tableLoading = {
    spinning: state.isLoading,
    indicator: <LoadingOutlined />
  };

  return (
    <>
      <div style={fileExplorerStyles}>
        <Button type="primary" icon={<ArrowUpOutlined />} onClick={goBack} />
        <FileBreadcrumb path={path} callback={goAssignationDir} />
      </div>
      <Table
        bordered={false}
        columns={columns(goDir, goDownload)}
        dataSource={fileExplorerDataHandle(state.fileExplorer)}
        size="small"
        loading={tableLoading}
        pagination={paginationProps}
      />
    </>
  );
}

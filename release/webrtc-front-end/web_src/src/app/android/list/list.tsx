import { LoadingOutlined } from '@ant-design/icons';
import { Table } from 'antd';
import React, { ReactElement } from 'react';

import { columns, paginationProps, ImageListData } from '../shared/models/list';
import { useGetImageListApi } from '../shared/services/get-image-list';
import { AndroidContainer } from '../shared/styles/list-styles';
import { sortAndroidList } from '../shared/utils/sort';

export function AndroidList(): ReactElement {
  const stateList = useGetImageListApi();
  const houdini = process.env.REACT_APP_USE_HOUDINI?.toLowerCase();

  const hList = stateList.androidList
    .filter((item): boolean => item.tag !== 'latest' && item.tag.includes('houdini'))
    .map((item): ImageListData => ({ tag: item.tag.replace('-houdini', ''), create_date: item.create_date }));
  const nList = stateList.androidList.filter((item): boolean => item.tag !== 'latest' && !item.tag.includes('houdini'));

  const tableLoading = {
    spinning: stateList.isLoading,
    indicator: <LoadingOutlined />
  };

  return (
    <AndroidContainer>
      <Table
        bordered={false}
        columns={columns}
        dataSource={sortAndroidList(houdini === 'true' ? hList : nList)}
        size="small"
        pagination={paginationProps}
        loading={tableLoading}
      />
    </AndroidContainer>
  );
}

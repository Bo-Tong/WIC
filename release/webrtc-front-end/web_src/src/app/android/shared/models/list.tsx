import { MobileFilled } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';

export const columns: ColumnsType<object> = [
  {
    title: 'Android images',
    dataIndex: 'tag',
    key: 'tag',
    render: (text: string): ReactElement => (
      <>
        <MobileFilled />
        <Link to={`/android/${text}`}>{text}</Link>
      </>
    )
  }
];

export const paginationProps = { pageSize: 30, hideOnSinglePage: true };

export interface ImageListData {
  tag: string;
  create_date: string;
}

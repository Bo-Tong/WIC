import { Result } from 'antd';
import React, { ReactElement } from 'react';

export function ErrorPage(props: { err: string }): ReactElement {
  return <Result status="error" title={props.err} />;
}

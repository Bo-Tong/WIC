import { AlertProps } from 'antd/lib/alert';
import React, { ReactElement } from 'react';

export function Alert(a: AlertProps): ReactElement {
  return <Alert message={a.message} type={a.type} />;
}

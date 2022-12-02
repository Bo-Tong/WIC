import { Button, Result } from 'antd';
import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { SuccessPageProps } from '../models/shared-data';

export function Success(props: SuccessPageProps): ReactElement {
  return (
    <Result
      status="success"
      title={props.title}
      extra={[
        <Button type="primary" key={props.uniKey}>
          <Link to="/">{props.btnText}</Link>
        </Button>
      ]}
    />
  );
}

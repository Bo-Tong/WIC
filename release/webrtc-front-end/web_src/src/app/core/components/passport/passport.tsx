import { Button, Form, Input } from 'antd';
import React, { useEffect, ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { userLoadError } from '../../redux/user/user-actions';
import { UserState } from '../../redux/user/user-reducer';
import { passportInitialValues } from '../../shared/models/user';
import { useSignIn } from '../../shared/services/user-sign-in';
import { ContainerFormBottom } from '../../shared/styles/layout.styles';
import { PassportContainer, PassportLayout } from '../../shared/styles/passport.styles';

export function Passport(props: UserState): ReactElement {
  const dispatch = useDispatch();

  useEffect((): void | (() => void | undefined) => {
    dispatch(userLoadError(undefined));
  }, [dispatch]);

  return (
    <PassportLayout>
      <PassportContainer>
        <Form initialValues={passportInitialValues} onFinish={useSignIn} requiredMark={false}>
          <h2>Android Cloud Client</h2>
          <p>{props.errorMsg}</p>
          <Form.Item name="username">
            <Input placeholder="Username" autoComplete="off" size="large" disabled={props.isLoggingIn} />
          </Form.Item>
          <Form.Item name="password">
            <Input.Password placeholder="Password" autoComplete="off" size="large" disabled={props.isLoggingIn} />
          </Form.Item>
          <Form.Item>
            <Button block={true} type="primary" htmlType="submit" loading={props.isLoggingIn}>
              Sign in
            </Button>
          </Form.Item>
          <ContainerFormBottom>
            <Link to="/enroll">Sign up</Link>
          </ContainerFormBottom>
        </Form>
      </PassportContainer>
    </PassportLayout>
  );
}

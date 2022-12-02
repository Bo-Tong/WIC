import { Button, Form, Input } from 'antd';
import React, { ReactElement } from 'react';

import { Success } from '../../shared/components/success';
import { enrollInitialValues } from '../shared/models/enroll';
import { sysMsg } from '../shared/models/msg';
import { useEnrollApi } from '../shared/services/user-enroll';
import { EnrollContainer, EnrollSection } from '../shared/styles/enroll.styles';
import { checkUsername, confirmPwd } from '../shared/utils/validates';

export function Enroll(): ReactElement {
  const [form] = Form.useForm();
  const [state, enroll] = useEnrollApi();

  return (
    <>
      {!state.isSuccess ? (
        <EnrollContainer>
          <h2>Sign up</h2>
          <Form form={form} layout="vertical" initialValues={enrollInitialValues} onFinish={enroll} requiredMark={false}>
            <EnrollSection>
              <Form.Item label="Username" name="username" rules={[{ required: true, message: sysMsg.userMsg.Invalid }, checkUsername]}>
                <Input autoComplete="off" size="large" />
              </Form.Item>
              <Form.Item label="Password" name="password" rules={[{ required: true, message: sysMsg.userMsg.Invalid }]}>
                <Input.Password autoComplete="off" size="large" />
              </Form.Item>
              <Form.Item
                label="Confirm password"
                name="cpwd"
                dependencies={['password']}
                rules={[{ required: true, message: sysMsg.userMsg.PwdNotMatch }, confirmPwd(form)]}
              >
                <Input.Password autoComplete="off" size="large" />
              </Form.Item>
            </EnrollSection>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={state.isLoading}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </EnrollContainer>
      ) : (
        <Success title="Success" btnText="Go to sign in" uniKey="goLogin" />
      )}
    </>
  );
}

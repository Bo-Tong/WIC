import { FormInstance, Rule } from 'antd/lib/form';
import axios from 'axios';
import { debounce } from 'lodash';
import { Key } from 'readline';

import { HttpStatusCode } from '../models/http-status-code';
import { sysMsg } from '../models/msg';
import { CHECK_USERNAME } from '../services/shared-apis';

export const pwdReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
export const fileNameReg = /^[-_A-Za-z0-9.]+$/g;

export const confirmPwd = (form: FormInstance): { validator(rule: Rule, value: Key): Promise<void> } => ({
  validator(rule: Rule, value: Key): Promise<void> {
    if (!value || form.getFieldValue('password') === value) {
      return Promise.resolve();
    }
    return Promise.reject(sysMsg.userMsg.PwdNotMatch);
  }
});

export const checkUsername = (): { validator(rule: Rule, value: string): Promise<void> } => ({
  async validator(rule: Rule, value: string): Promise<void> {
    if (!value) {
      return Promise.resolve();
    }

    const param = new URLSearchParams();
    param.append('username', value);

    const result = await axios(CHECK_USERNAME, {
      method: 'POST',
      data: param
    });
    if (result.status !== HttpStatusCode.Ok) {
      return Promise.reject(sysMsg.baseMsg.ServiceError);
    }
    if (result.data.code) {
      return Promise.resolve();
    }
    return Promise.reject(sysMsg.userMsg.DuplicateUsername);
  }
});

// TODO: Cause antd still not supports a good way to add debounce, Will do it later.
export const debounceCheck = debounce(checkUsername, 500);

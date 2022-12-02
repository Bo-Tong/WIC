import { BaseProps } from './shared-data';

export interface UserModel {
  username: string;
  password: string;
}

export interface UserResponse extends BaseProps {
  username: string;
}

export const passportInitialValues: UserModel = {
  username: '',
  password: ''
};

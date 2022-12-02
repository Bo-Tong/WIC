import { UserModel } from './user';

export const enrollInitialValues: EnrollModel = {
  username: '',
  password: '',
  passwordConfirm: ''
};

export interface EnrollModel extends UserModel {
  passwordConfirm: string;
}

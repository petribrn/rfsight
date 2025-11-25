import { UserInfo } from '../types';

export interface IRegisterUserPayload {
  username: string;
  email: string;
  firstName: string;
  permission?: number;
  organizationId: string;
  lastName: string;
  password: string;
}

export interface IUpdateUserData {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  permission?: number;
  organizationId?: string;
}

export interface IUpdateUserPayload {
  id: string;
  updateUserData: IUpdateUserData;
}

export interface IInitialUserState {
  user: UserInfo | null;
}

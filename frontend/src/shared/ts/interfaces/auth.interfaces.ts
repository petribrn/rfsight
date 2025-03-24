import { Dispatch, ReactNode, SetStateAction } from 'react';

export interface IAuth {
  username: string | null;
  token: string | null;
}

export interface IAuthContextData {
  auth: IAuth;
  setAuth: Dispatch<SetStateAction<IAuth>>;
  persist: true | false;
  setPersist: Dispatch<SetStateAction<true | false>>;
}

export interface AppAuthProviderProps {
  children: ReactNode;
}

export interface IAuthResponse {
  accessToken: string;
}

export interface IRefreshResponse {
  accessToken: string;
  username: string;
}

export interface IForgotPasswdPayload {
  email: string;
}

export interface IResetPasswdPayload {
  password: string;
  passwordConfirmation: string;
  token: string;
}

export interface IResetPasswordForm {
  token: string | undefined;
}

export interface ILoginPayload {
  username: string;
  password: string;
}

export interface IToken {
  sub: string;
  permission: number;
  exp: Date;
  mode: string;
}

export interface InitialAuthState {
  username: string | null;
  token: string | null;
  persist: boolean;
}

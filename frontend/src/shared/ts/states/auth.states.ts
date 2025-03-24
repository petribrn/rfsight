import { InitialAuthState } from '../interfaces';

export const initialAuthState: InitialAuthState = {
  username: null,
  token: null,
  persist: JSON.parse(localStorage.getItem('persistSession')!) || false,
};

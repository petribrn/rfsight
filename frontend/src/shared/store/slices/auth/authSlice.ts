import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IAuth } from '../../../ts/interfaces';
import { initialAuthState } from '../../../ts/states/auth.states';
import type { RootState } from '../../store';

export const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setCredentials: (state, action: PayloadAction<IAuth>) => {
      const { username, token } = action.payload;
      state.username = username;
      state.token = token;
    },
    togglePersist: (state) => {
      state.persist = !state.persist;
      localStorage.setItem('persistSession', JSON.stringify(state.persist));
    },
    logOut: (state) => {
      state.username = null;
      state.token = null;
      state.persist = false;
      localStorage.setItem('persistSession', JSON.stringify(state.persist));
    },
  },
});

export const { setCredentials, togglePersist, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.username;
export const selectCurrentToken = (state: RootState) => state.auth.token;
export const selectCurrentPersistState = (state: RootState) =>
  state.auth.persist;

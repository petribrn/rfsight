import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InitialUserState } from '../../../ts/states';
import { UserInfo } from '../../../ts/types';
import type { RootState } from '../../store';

export const userSlice = createSlice({
  name: 'user',
  initialState: InitialUserState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.user = { ...action.payload };
    },
  },
});

export const { setUserInfo } = userSlice.actions;

export default userSlice.reducer;

export const selectUserInfo = (state: RootState) => state.user.user;

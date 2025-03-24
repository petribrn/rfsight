import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IOrganization } from '../../../ts/interfaces';
import { InitialOrganizationState } from '../../../ts/states';
import type { RootState } from '../../store';

export const organizationSlice = createSlice({
  name: 'organization',
  initialState: InitialOrganizationState,
  reducers: {
    setOrganizationInfo: (state, action: PayloadAction<IOrganization>) => {
      state.organization = { ...action.payload };
    },
  },
});

export const { setOrganizationInfo } = organizationSlice.actions;

export default organizationSlice.reducer;

export const selectCurrentOrg = (state: RootState) =>
  state.organization.organization;

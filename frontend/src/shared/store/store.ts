import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './slices/api/apiSlice';
import authReducer from './slices/auth/authSlice';
import organizationReducer from './slices/organization/organizationSlice';
import userReducer from './slices/user/userSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    user: userReducer,
    organization: organizationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

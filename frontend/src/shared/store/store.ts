import { configureStore } from '@reduxjs/toolkit';
import { websocketUrl } from '../ts/enums';
import { createWebsocketMiddleware } from './middleware/websocketMiddleware';
import { apiSlice } from './slices/api/apiSlice';
import authReducer from './slices/auth/authSlice';
import monitorReducer from './slices/monitor/monitorSlice';
import organizationReducer from './slices/organization/organizationSlice';
import timeseriesReducer from './slices/timeseries/timeseriesSlice';
import topologyReducer from './slices/topology/topologySlice';
import userReducer from './slices/user/userSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    user: userReducer,
    organization: organizationReducer,
    monitor: monitorReducer,
    topology: topologyReducer,
    timeseries: timeseriesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      apiSlice.middleware,
      createWebsocketMiddleware(websocketUrl),
    ]),

  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

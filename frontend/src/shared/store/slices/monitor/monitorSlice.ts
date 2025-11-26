// store/slices/monitorSlice.ts
import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';

type MonitorState = {
  lastUpdated?: string;
};

export type DeviceMonitorEntity = {
  id: string;
  online: boolean;
  latency?: number;
  stats?: Record<string, any>;
  actionsStatuses?: Record<string, { status: string; message?: string }>;
  timestamp?: string;
};

const devicesAdapter = createEntityAdapter({
  selectId: (d: DeviceMonitorEntity) => d.id,
});

const slice = createSlice({
  name: 'monitor',
  initialState: devicesAdapter.getInitialState<MonitorState>({ lastUpdated: undefined }),
  reducers: {
    upsertDevice(state, action: PayloadAction<DeviceMonitorEntity>) {
      devicesAdapter.upsertOne(state, action.payload);
      state.lastUpdated = action.payload.timestamp ?? new Date().toISOString();
    },
    bulkUpsertDevices(state, action: PayloadAction<DeviceMonitorEntity[]>) {
      devicesAdapter.upsertMany(state, action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    removeDevice(state, action: PayloadAction<string>) {
      devicesAdapter.removeOne(state, action.payload);
    },
    clearAll(state) {
      devicesAdapter.removeAll(state);
      state.lastUpdated = undefined;
    },
  },
});

export const monitorSelectors = devicesAdapter.getSelectors< (state: RootState) => any >((s) => s.monitor);
export const monitorActions = slice.actions;
export default slice.reducer;

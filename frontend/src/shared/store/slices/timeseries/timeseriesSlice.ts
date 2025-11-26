import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Point = { ts: string; value: number };
type SeriesKey = string; // `${deviceId}::${metric}`

type TimeseriesState = {
  series: Record<SeriesKey, Point[]>;
  maxPoints: number;
};

const initialState: TimeseriesState = { series: {}, maxPoints: 120 };

const slice = createSlice({
  name: 'timeseries',
  initialState,
  reducers: {
    pushPoint(state, action: PayloadAction<{ deviceId: string; metric: string; point: Point }>) {
      const { deviceId, metric, point } = action.payload;
      const key = `${deviceId}::${metric}`;
      const arr = state.series[key] ?? [];
      arr.push(point);
      if (arr.length > state.maxPoints) arr.splice(0, arr.length - state.maxPoints);
      state.series[key] = arr;
    },
    setMaxPoints(state, action: PayloadAction<number>) {
      state.maxPoints = action.payload;
    },
    clearSeries(state, action: PayloadAction<{ deviceId?: string; metric?: string } | undefined>) {
      if (!action.payload) {
        state.series = {};
        return;
      }
      const { deviceId, metric } = action.payload;
      if (deviceId && metric) {
        delete state.series[`${deviceId}::${metric}`];
      } else if (deviceId) {
        Object.keys(state.series).forEach(k => {
          if (k.startsWith(`${deviceId}::`)) delete state.series[k];
        });
      }
    },
  }
});

export const timeseriesActions = slice.actions;
export default slice.reducer;

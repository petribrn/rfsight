// store/slices/topologySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type TopologyState = {
  organizations: Record<string, any>; // organizationId -> { networks: { networkId -> graph } }
  lastUpdated?: string;
};

const initialState: TopologyState = {
  organizations: {},
  lastUpdated: undefined,
};

const slice = createSlice({
  name: 'topology',
  initialState,
  reducers: {
    setOrganizations(state, action: PayloadAction<Record<string, any>>) {
      state.organizations = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    updateNetworkGraph(state, action: PayloadAction<{ orgId: string; networkId: string; graph: any }>) {
      const { orgId, networkId, graph } = action.payload;
      state.organizations[orgId] = state.organizations[orgId] ?? { networks: {} };
      state.organizations[orgId].networks[networkId] = graph;
      state.lastUpdated = new Date().toISOString();
    },
    clearAll(state) {
      state.organizations = {};
    }
  }
});

export const topologyActions = slice.actions;
export default slice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DeviceData } from '../../../ts/types';
import { RootState } from '../../store';

export const selectTopologyFor = (orgId: string, networkId: string) =>
  (state: RootState) => {
    return state.topology.organizations?.[orgId]?.networks?.[networkId] ?? null;
  };

export const selectTopologyOrganizations =
  (state: RootState) => state.topology.organizations;

export const selectTopologyTimestamp =
  (state: RootState) => state.topology.lastUpdated;

type TopologyState = {
  organizations: Record<string, any>;
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
    setInitialNetworkDevices(
      state,
      action: PayloadAction<{
        orgId: string;
        networkId: string;
        devices: Array<DeviceData>;
      }>
    ) {
      const { orgId, networkId, devices } = action.payload;

      state.organizations[orgId] = state.organizations[orgId] ?? { networks: {} };

      const existing = state.organizations[orgId].networks[networkId] ?? {
        nodes: [],
        links: []
      };

      const newNodes = devices.map(d => ({
        id: d.id,
        label: d.name ?? "Dispositivo",
        name: d.name,
        mac: d.mac_address,
        ip: d.ip_address,
        model: d.model,
        fwVersion: d.fw_version,
        location: d.location,
        type: "adoptedDevice",
        online: false,
        latency: null,
      }));

      const mergedNodes = [
        ...newNodes,
        ...existing.nodes.filter(n => !newNodes.find(x => x.id === n.id))
      ];

      state.organizations[orgId].networks[networkId] = {
        ...existing,
        nodes: mergedNodes
      };

      state.lastUpdated = new Date().toISOString();
    },
    updateNetworkGraph(
      state,
      action: PayloadAction<{ orgId: string; networkId: string; graph: any }>
    ) {
      const { orgId, networkId, graph } = action.payload;

      state.organizations[orgId] = state.organizations[orgId] ?? { networks: {} };
      const existing = state.organizations[orgId].networks[networkId] ?? {
        nodes: [],
        links: []
      };

      // função de merge não destrutiva
      const safeMerge = (oldNode: any, incoming: any) => {
        const out: any = { ...oldNode };

        for (const key in incoming) {
          const v = incoming[key];
          if (v === null || v === undefined || v === "") continue;
          out[key] = v;
        }

        // garante label consistente
        out.label = out.name || out.ip || out.id;

        return out;
      };

      // ids recebidos na atualização atual
      const incomingIds = new Set(graph.nodes.map(n => n.id));

      // atualiza ou adiciona nodes
      let mergedNodes = [
        ...existing.nodes
          .filter(n => {
            // adoptedDevices nunca desaparecem do topo
            if (n.type === "adoptedDevice") return true;

            // qualquer outro node (station, lldp, etc)
            // só permanece se aparecer no topology atual
            return incomingIds.has(n.id);
          })// REMOVE nós que não vieram mais
          .map(n => {
            const inc = graph.nodes.find(x => x.id === n.id);
            return inc ? safeMerge(n, inc) : n;
          }),

        // adiciona nodes novos
        ...graph.nodes
          .filter(n => !existing.nodes.find(x => x.id === n.id))
          .map(n => ({
            ...n,
            label: n.name || n.ip || n.id
          }))
      ];

      // remover links órfãos
      const incomingLinkKeys = new Set(
        (graph.links ?? []).map(l => `${l.source}-${l.target}`)
      );

      let mergedLinks = (graph.links ?? existing.links).filter(l =>
        incomingLinkKeys.has(`${l.source}-${l.target}`)
      );

      state.organizations[orgId].networks[networkId] = {
        ...existing,
        nodes: mergedNodes,
        links: mergedLinks
      };

      state.lastUpdated = new Date().toISOString();
    },
    mergeTopology: (state, action) => {
      const incoming = action.payload;

      for (const [orgId, orgData] of Object.entries(incoming)) {
        state.organizations[orgId] = state.organizations[orgId] ?? { networks: {} };

        for (const [networkId, netData] of Object.entries(orgData.networks ?? {})) {
          const existingNet = state.organizations[orgId].networks[networkId] ?? {
            nodes: [],
            links: []
          };

          const incomingNodes = netData.nodes ?? [];
          const incomingIds = new Set(incomingNodes.map(n => n.id));

          const mergedNodes = [
            ...existingNet.nodes
              .filter(n => {
                if (n.type === "adoptedDevice") return true;
                return incomingIds.has(n.id);
              })
              .map(n => {
                const inc = incomingNodes.find(x => x.id === n.id);
                return inc ? { ...n, ...inc } : n;
              }),

            ...incomingNodes
              .filter(n => !existingNet.nodes.some(x => x.id === n.id))
          ];

          state.organizations[orgId].networks[networkId] = {
            ...existingNet,
            ...netData,
            nodes: mergedNodes
          };
        }
      }

      state.lastUpdated = new Date().toISOString();
    },
    clearAll(state) {
      state.organizations = {};
    }
  }
});

export const topologyActions = slice.actions;
export default slice.reducer;

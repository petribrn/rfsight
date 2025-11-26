import { createSelector } from "@reduxjs/toolkit";
import { monitorSelectors } from "../slices/monitor/monitorSlice";
import { RootState } from "../store";

// -------------------------------------------
// Seleciona deviceIds presentes no grafo
// -------------------------------------------
export const selectTopologyDeviceIds = (orgId: string, networkId: string) =>
  (state: RootState) => {
    const graph = state.topology.organizations?.[orgId]?.networks?.[networkId];
    if (!graph?.nodes) return [];
    return graph.nodes
      .filter((n: any) => n.type === "adoptedDevice")
      .map((n: any) => n.id);
  };

// -------------------------------------------
// Seleciona devices monitorados do grafo
// -------------------------------------------
export const selectDevicesForNetwork = (orgId: string, networkId: string) =>
  (state: RootState) => {
    const ids = selectTopologyDeviceIds(orgId, networkId)(state);
    const all = monitorSelectors.selectAll(state);
    return all.filter(d => ids.includes(d.id));
  };

// -------------------------------------------
// Contagem online/offline
// -------------------------------------------
export const selectOnlineOfflineStats = (orgId: string, networkId: string) =>
  (state: RootState) => {
    const devices = selectDevicesForNetwork(orgId, networkId)(state);
    const online = devices.filter(d => d.online).length;
    const offline = devices.length - online;
    return { total: devices.length, online, offline };
  };

// -------------------------------------------
// Contagem de estações wifiStation
// -------------------------------------------
export const selectStationsCount = (orgId: string, networkId: string) =>
  (state: RootState) => {
    const graph = state.topology.organizations?.[orgId]?.networks?.[networkId];
    if (!graph?.nodes) return 0;
    return graph.nodes.filter((n: any) => n.type === "wifiStation").length;
  };

// -------------------------------------------
// Média de latência
// -------------------------------------------
export const selectAverageLatency = (orgId: string, networkId: string) =>
  (state: RootState) => {
    const devices = selectDevicesForNetwork(orgId, networkId)(state);
    const latencies = devices
      .map(d => d.latency)
      .filter(v => typeof v === "number");

    if (latencies.length === 0) return 0;

    const sum = latencies.reduce((a, b) => a + b, 0);
    return sum / latencies.length;
  };

// -------------------------------------------
// Health Score (online/offline + latência)
// -------------------------------------------
export const selectNetworkHealth = (orgId: string, networkId: string) =>
  (state: RootState) => {
    const stats = selectOnlineOfflineStats(orgId, networkId)(state);
    if (stats.total === 0) return 0;

    const avgLat = selectAverageLatency(orgId, networkId)(state);

    const availabilityScore = stats.online / stats.total;

    const latencyScore = Math.max(0, Math.min(1, 1 - avgLat / 200));

    const health =
      availabilityScore * 0.7 +
      latencyScore * 0.3;

    return Math.round(health * 100);
  };

// -------------------------------------------
// Topologia com dados de monitoramento
// -------------------------------------------
export const selectMergedTopology = (orgId: string, networkId: string) =>
  createSelector(
    [
      (state: RootState) =>
        state.topology.organizations?.[orgId]?.networks?.[networkId] ?? null,
      (state: RootState) => state.monitor,
    ],
    (topology, monitorState) => {
      if (!topology) return null;

      const monitorMap = monitorSelectors.selectEntities({ monitor: monitorState });

      const mergedNodes = (topology.nodes ?? []).map((node: any) => {
        if (node.type === "adoptedDevice") {
          const mon = monitorMap[node.id];
          return {
            ...node,
            uptime: mon?.stats?.uptime ?? null,
            online: mon?.online ?? false,
            latency: mon?.latency ?? null,
          };
        }
        return node;
      });

      return { ...topology, nodes: mergedNodes };
    }
  );

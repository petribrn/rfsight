import { createSelector } from "@reduxjs/toolkit";
import { formatThroughput } from "../../ts/helpers";
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
// Health Score atualizado (availability + latency + throughput)
// -------------------------------------------
export const selectNetworkHealth = (orgId: string, networkId: string) =>
  (state: RootState) => {
    const stats = selectOnlineOfflineStats(orgId, networkId)(state);
    const avgLat = selectAverageLatency(orgId, networkId)(state);
    const { download, upload } = selectNetworkThroughput(orgId, networkId)(state);
    const stations = selectStationsCount(orgId, networkId)(state);

    if (stats.total === 0) {
      return {
        healthScore: 0,
        healthScoreExplanation: 'Sem dispositivos na rede, health retorna 0.'
      };
    }

    const availabilityScore = stats.online / stats.total;

    const latencyScore =
      stats.online === 0
        ? 0
        : Math.max(0, Math.min(1, 1 - avgLat / 200));

    const totalBps = download + upload;
    const totalMbps = totalBps / 1_000_000;

    const baselinePerStation = 5; // Mbps
    const maxExpected = Math.max(1, stations * baselinePerStation);

    const throughputScore =
      stats.online === 0
        ? 0
        : stations === 0
          ? 0
          : Math.max(0, Math.min(1, totalMbps / maxExpected));

    const health =
      availabilityScore * 0.5 +
      latencyScore * 0.3 +
      throughputScore * 0.2;

    const healthScore = Math.round(health * 100);

    const donwloadFormatted = formatThroughput(download);
    const uploadFormatted = formatThroughput(upload);
    const totalMbpsFormatted = formatThroughput(totalMbps);
    const healthScoreExplanation = `Cálculo da Saúde da rede:

      1) Disponibilidade (50%)
        online = ${stats.online}
        total = ${stats.total}
        availabilityScore = ${availabilityScore.toFixed(3)}

      2) Latência (30%)
        avgLatency = ${avgLat} ms
        latencyScore = 1 - (${avgLat} / 200)
        latencyScore = ${latencyScore.toFixed(3)}

      3) Throughput baseado nas estações (20%)
        download = ${donwloadFormatted.value} ${donwloadFormatted.format}
        upload   = ${uploadFormatted.value} ${uploadFormatted.format}
        totalMbps = ${totalMbpsFormatted.value} ${totalMbpsFormatted.format}
        stations = ${stations}
        maxExpected = ${maxExpected} Mbps
        throughputScore = ${throughputScore.toFixed(3)}

      Fórmula final:
        health = (0.5 × availabilityScore)
              + (0.3 × latencyScore)
              + (0.2 × throughputScore)

      Resultado:
        Saúde da rede = ${healthScore}
      `;

    //-------------------------------------------------------------
    // Return structured result
    //-------------------------------------------------------------
    return {
      healthScore,
      healthScoreExplanation,
    };
  };

// -------------------------------------------
// Health Score (online/offline + latência)
// -------------------------------------------
// export const selectNetworkHealth = (orgId: string, networkId: string) =>
//   (state: RootState) => {
//     const stats = selectOnlineOfflineStats(orgId, networkId)(state);
//     if (stats.total === 0) return 0;

//     const avgLat = selectAverageLatency(orgId, networkId)(state);

//     const availabilityScore = stats.online / stats.total;

//     const latencyScore = Math.max(0, Math.min(1, 1 - avgLat / 200));

//     const health =
//       availabilityScore * 0.7 +
//       latencyScore * 0.3;

//     return Math.round(health * 100);
//   };

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

// -------------------------------------------
// Throughput agregado (sum das estações)
// -------------------------------------------
export const selectNetworkThroughput = (orgId: string, networkId: string) =>
  (state: RootState) => {
    const graph = state.topology.organizations?.[orgId]?.networks?.[networkId];
    if (!graph?.nodes) return { download: 0, upload: 0 };

    const stations = graph.nodes.filter((n: any) => n.type === "wifiStation");

    let download = 0; // rx
    let upload = 0;   // tx

    for (const s of stations) {
      download += s.throughput_rx_bps ?? 0;
      upload += s.throughput_tx_bps ?? 0;
    }

    return {
      download: Math.round(download),
      upload: Math.round(upload),
    };
  };

// -------------------------------------------
// Throughput por estação (para TopologyViewer)
// -------------------------------------------
export const selectStationThroughput = (orgId: string, networkId: string) =>
  (state: RootState) => {
    const graph = state.topology.organizations?.[orgId]?.networks?.[networkId];
    if (!graph?.nodes) return [];

    return graph.nodes
      .filter((n: any) => n.type === "wifiStation")
      .map(n => ({
        id: n.id,
        download: n.throughput_rx_bps ?? 0,
        upload: n.throughput_tx_bps ?? 0
      }));
  };

// hooks/useNetworkMetrics.ts (ou em hooks/index.ts se preferir)
import { useSelector } from 'react-redux';
import {
  selectAverageLatency,
  selectNetworkHealth,
  selectNetworkThroughput,
  selectOnlineOfflineStats,
  selectStationsCount
} from '../store/selectors/topologySelectors';

export const useNetworkMetrics = (orgId: string, networkId: string) => {
  const onlineOffline = useSelector(selectOnlineOfflineStats(orgId, networkId));
  const stations = useSelector(selectStationsCount(orgId, networkId));
  const avgLatency = useSelector(selectAverageLatency(orgId, networkId));
  const health = useSelector(selectNetworkHealth(orgId, networkId));
  const throughput = useSelector(selectNetworkThroughput(orgId, networkId));

  return {
    online: onlineOffline.online ?? 0,
    offline: onlineOffline.offline ?? 0,
    total: onlineOffline.total ?? 0,
    stations: stations ?? 0,
    avgLatency: avgLatency ?? null,
    health: health ?? 0,
    download: throughput.download ?? 0,
    upload: throughput.upload ?? 0,
  };
};

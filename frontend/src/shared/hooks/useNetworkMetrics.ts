import { useSelector } from "react-redux";
import {
  selectAverageLatency,
  selectNetworkHealth,
  selectOnlineOfflineStats,
  selectStationsCount
} from "../store/selectors/topologySelectors";

export const useNetworkMetrics = (orgId: string, networkId: string) => {
  const onlineOffline = useSelector(selectOnlineOfflineStats(orgId, networkId));
  const stations = useSelector(selectStationsCount(orgId, networkId));
  const avgLatency = useSelector(selectAverageLatency(orgId, networkId));
  const health = useSelector(selectNetworkHealth(orgId, networkId));

  return {
    online: onlineOffline.online,
    offline: onlineOffline.offline,
    total: onlineOffline.total,
    stations,
    avgLatency,
    health,
  };
};

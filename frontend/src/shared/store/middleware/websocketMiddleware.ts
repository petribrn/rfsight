// store/middleware/websocketMiddleware.ts
import { Dispatch, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { WebsocketMessage, WebsocketMonitorMessage, WebsocketTopologyMessage } from '../../ts/types';
import { DeviceMonitorEntity, monitorActions } from '../slices/monitor/monitorSlice';
import { timeseriesActions } from '../slices/timeseries/timeseriesSlice';
import { topologyActions } from '../slices/topology/topologySlice';
import { RootState } from '../store';

const WS_BASE = (url: string, token: string | null) => {
  if (!token) return url;
  // token as query param (browser-safe)
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}token=${token}`;
};

export const createWebsocketMiddleware = (wsUrl: string): Middleware => {
  let socket: WebSocket | null = null;
  let reconnectTimer: number | null = null;
  let heartbeatTimer: number | null = null;

  const startHeartbeat = (ws: WebSocket) => {
    if (heartbeatTimer) window.clearInterval(heartbeatTimer);
    heartbeatTimer = window.setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        try { ws.send(JSON.stringify({ messageType: 'ping' })); } catch {}
      }
    }, 25000); // 25s
  };

  return (store: MiddlewareAPI<Dispatch, RootState>) => (next) => (action) => {
    const state = store.getState();

    // connect action: open socket using token from auth slice
    if (action.type === 'websocket/connect') {
      const token = state.auth.token;
      if (socket && socket.readyState === WebSocket.OPEN) return next(action);

      const url = WS_BASE(wsUrl, token);
      socket = new WebSocket(url);

      console.log(url)

      socket.onopen = () => {
        store.dispatch({ type: 'websocket/open' });
        startHeartbeat(socket as WebSocket);
      };

      socket.onmessage = (ev) => {
        let msg: WebsocketMessage | null = null;
        try { msg = JSON.parse(ev.data); } catch (e) { return; }

        if (!msg || !msg.messageType) return;

        console.log(msg);

        // route by messageType
        switch (msg.messageType) {
          case 'deviceMonitor': {
            const orgs = (msg as WebsocketMonitorMessage).data.organizations ?? {};

            // Flatten into device list for the monitor slice
            const flattened: DeviceMonitorEntity[] = [];

            for (const [orgId, orgData] of Object.entries(orgs)) {
              if (!orgData || !orgData.networks) continue;

              for (const [networkId, netData] of Object.entries(orgData.networks)) {
                if (!netData || !netData.devices) continue;

                for (const [deviceId, dev] of Object.entries(netData.devices)) {
                  if (!dev) continue;

                  flattened.push({
                    id: deviceId, // entity adapter uses id field
                    online: dev.online,
                    latency: dev.latency,
                    actionsStatuses: dev.actionsStatuses,
                    stats: dev.stats,
                    timestamp: dev.timestamp
                  });

                  // push time series for numeric stats
                  if (dev.stats) {
                    const ts = dev.timestamp ?? new Date().toISOString();
                    Object.entries(dev.stats).forEach(([metric, v]) => {
                      if (typeof v === 'number') {
                        store.dispatch(timeseriesActions.pushPoint({
                          deviceId,
                          metric,
                          point: { ts, value: v }
                        }));
                      }
                    });

                    // explicit latency
                    if (typeof dev.latency === 'number') {
                      store.dispatch(timeseriesActions.pushPoint({
                        deviceId,
                        metric: 'latency',
                        point: { ts: dev.timestamp ?? new Date().toISOString(), value: dev.latency }
                      }));
                    }
                  }
                }
              }
            }

            // normalize devices into Redux
            store.dispatch(monitorActions.bulkUpsertDevices(flattened));
            break;
          }
          case 'topology': {
            const orgs = (msg as WebsocketTopologyMessage).data.organizations ?? {};
            store.dispatch(topologyActions.setOrganizations(orgs));
            break;
          }
          default:
            store.dispatch({ type: 'websocket/message_unhandled', payload: msg });
        }
      };

      socket.onclose = () => {
        store.dispatch({ type: 'websocket/closed' });
        if (heartbeatTimer) { window.clearInterval(heartbeatTimer); heartbeatTimer = null; }
        // try reconnect after backoff
        if (reconnectTimer) window.clearTimeout(reconnectTimer);
        reconnectTimer = window.setTimeout(() => {
          store.dispatch({ type: 'websocket/connect' });
        }, 2000);
      };

      socket.onerror = (err) => {
        store.dispatch({ type: 'websocket/error', error: err });
      };

      return next(action);
    }

    // disconnect action
    if (action.type === 'websocket/disconnect') {
      if (socket) {
        try { socket.close(); } catch {}
        socket = null;
      }
      if (reconnectTimer) { window.clearTimeout(reconnectTimer); reconnectTimer = null; }
      if (heartbeatTimer) { window.clearInterval(heartbeatTimer); heartbeatTimer = null; }
      return next(action);
    }

    // allow other actions
    return next(action);
  };
};

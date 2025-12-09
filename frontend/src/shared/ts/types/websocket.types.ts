export type WsDeviceMonitorPayload = {
  deviceId: string;
  online: boolean;
  latency?: number;
  stats?: Record<string, any>;
  actionsStatuses?: Record<string, { status: string; message?: string }>;
  timestamp?: string;
};

export type WsMonitorDeviceMap = Record<string, WsDeviceMonitorPayload>; // deviceId -> monitor info

export type WsMonitorNetwork = {
  devices: WsMonitorDeviceMap;
};

export type WsMonitorOrganization = {
  networks: Record<string, WsMonitorNetwork>;
};

export type WsMonitorHierarchy = {
  organizations: Record<string, WsMonitorOrganization>;
};

export type WsTopologyNetworkGraph = {
  nodes: any[];
  links: any[];
  network: string;
};

export type WsTopologyNetwork = WsTopologyNetworkGraph | { error: string };

export type WsTopologyOrganization = {
  networks: Record<string, WsTopologyNetwork>;
};

export type WsTopologyHierarchy = {
  organizations: Record<string, WsTopologyOrganization>;
};

export type WebsocketMonitorMessage = {
  messageType: 'deviceMonitor';
  data: WsMonitorHierarchy;
};

export type WebsocketTopologyMessage = {
  messageType: 'topology';
  data: WsTopologyHierarchy;
};

export type WebsocketDefaultMessage = {
  messageType: string;
  data: any;
};


export type WebsocketMessage =
  | WebsocketMonitorMessage
  | WebsocketTopologyMessage
  | WebsocketDefaultMessage


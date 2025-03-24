export type Vlan = {
  enabled: boolean;
  id: number;
};

export type Tunnel = {
  enabled: boolean;
  mode: string;
  tunnelip: string;
  interface: string;
  localip: string;
  remoteip: string;
  vlan: Vlan;
  pmtudiscovery: boolean;
  mss: number;
  mtu: number;
};

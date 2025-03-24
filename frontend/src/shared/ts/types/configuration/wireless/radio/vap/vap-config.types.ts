import { Failover } from './failover/failover-config.types';
import { Security } from './security/secuity-config.types';

export type Rate = {
  legacy: string;
  maxLimit: number;
  mcs: string;
};

export type PPPoECircuitID = {
  enabled: boolean;
};

export type DHCP82 = {
  enabled: boolean;
  remotemode: string;
  circuitmode: string;
};

export type BSSID = {
  value: string;
  enabled: boolean;
};

export type Egress = {
  speed: number;
  enabled: boolean;
};

export type Ingress = Egress;

export type TrafficControl = {
  enabled: boolean;
  egress: Egress;
  ingress: Ingress;
};

export type FromURL = {
  autoupdate: boolean;
  interval: number;
  url: string;
};

export type ACL = {
  source: string;
  fromurl: FromURL;
  policy: string;
};

export type SSID2Vlan = {
  enabled: boolean;
  id: number;
};

export type Management = {
  enabled: boolean;
  tagged: boolean;
};

export type Vap = {
  rate: Rate;
  pppoecircuitid: PPPoECircuitID;
  cwm: boolean;
  dhcp82: DHCP82;
  bssid: BSSID;
  maxclients: number;
  trafficcontrol: TrafficControl;
  l2isolation: boolean;
  security: Security;
  preamble: string;
  wds: boolean;
  ssid: string;
  acl: ACL;
  failover: Failover;
  minsignal: number;
  hidden: boolean;
  mcastenhance: boolean;
  ifname: string;
  multicastecho: boolean;
  shortgi: boolean;
  wmm: boolean;
  mode: string;
  ssid2vlan: SSID2Vlan;
  vapisolation: boolean;
  mfp: string;
  wmmpreferdscp: boolean;
  management: Management;
};

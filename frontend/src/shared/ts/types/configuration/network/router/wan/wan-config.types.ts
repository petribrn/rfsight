export type Vlan = {
  enabled: boolean;
  id: number;
};

export type DnsStatic = {
  servers: Array<string>;
};

export type DnsWithEnabledField = DnsStatic & {
  enabled: boolean;
};

export type IP = {
  ip: string;
  prefix: number;
};

export type Static = {
  vlan: Vlan;
  dns: DnsStatic;
  ip: Array<IP>;
  gateway: string;
};

export type PPPoE = {
  servicename: string;
  username: string;
  vlan: Vlan;
  dns: DnsWithEnabledField;
  password: string;
  mtu: number;
};

export type Dynamic = {
  fallback: boolean;
  ip: Array<IP>;
  dns: DnsWithEnabledField;
  vlan: Vlan;
  gateway: string;
};

export type Wan = {
  static: Static;
  pppoe: PPPoE;
  dynamic: Dynamic;
  mode: string;
};

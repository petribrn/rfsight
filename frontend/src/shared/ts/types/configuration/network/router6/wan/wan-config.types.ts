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
  username: string;
  password: string;
  dns: DnsWithEnabledField;
  vlan: Vlan;
  mtu: number;
};

export type Dynamic = {
  vlan: Vlan;
  dns: DnsWithEnabledField;
  stateful: boolean;
  prefixdelegation: boolean;
};

export type Wan = {
  static: Static;
  pppoe: PPPoE;
  dynamic: Dynamic;
  mode: string;
};

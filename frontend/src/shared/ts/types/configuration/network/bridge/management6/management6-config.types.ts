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
  ip: Array<IP>;
  dns: DnsStatic;
  gateway: string;
};

export type Dynamic = {
  stateful: boolean;
  dns: DnsWithEnabledField;
};

export type Management6 = {
  static: Static;
  dynamic: Dynamic;
  mode: string;
};

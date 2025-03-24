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
  ip: Array<IP>;
  dns: DnsWithEnabledField;
  fallback: boolean;
  gateway: string;
};

export type Secondary = {
  enabled: boolean;
  ip: IP;
};

export type Management = {
  static: Static;
  dynamic: Dynamic;
  mode: string;
  secondary: Secondary;
};

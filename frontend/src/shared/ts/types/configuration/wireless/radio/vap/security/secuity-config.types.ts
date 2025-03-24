export type Das = {
  port: number;
  clientip: string;
  secret: string;
  enabled: boolean;
};

export type Server = {
  port: number;
  secret: string;
  address: string;
};

export type Accounting = {
  servers: Array<Server>;
  enabled: boolean;
};

export type Authentication = {
  servers: Array<Server>;
  eap: string;
  password: string;
  hmacsha1key: string;
  identity: string;
  credentials: string;
};

export type WPAEnterprise = {
  das: Das;
  accounting: Accounting;
  wpa2only: boolean;
  nasid: string;
  authentication: Authentication;
};

export type WPAPSK = {
  wpa2only: boolean;
  passphrase: string;
};

export type WEP = {
  index: number;
  length: number;
  key: string;
};

export type Security = {
  wpaenterprise: WPAEnterprise;
  wpapsk: WPAPSK;
  wep: WEP;
  mode: string;
};

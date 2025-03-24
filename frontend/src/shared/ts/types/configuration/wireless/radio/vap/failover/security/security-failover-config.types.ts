export type AuthenticationFailOver = {
  eap: string;
  password: string;
  hmacsha1key: string;
  identity: string;
  credentials: string;
};

export type WPAEnterpriseFailOver = {
  authentication: AuthenticationFailOver;
  wpa2only: boolean;
};

export type WPAPSKFailOver = {
  wpa2only: boolean;
  passphrase: string;
};

export type WEPFailOver = {
  index: number;
  length: number;
  key: string;
};

export type SecurityFailOver = {
  wpaenterprise: WPAEnterpriseFailOver;
  wpapsk: WPAPSKFailOver;
  wep: WEPFailOver;
  mode: string;
};

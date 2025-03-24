export type EtherStatus = {
  trap: boolean;
};

export type Host = {
  ip: string;
  time: number;
};

export type Ping = {
  trap: boolean;
  hosts: Array<Host>;
};

export type Noise = {
  trap: boolean;
  limit: number;
};

export type Reboot = {
  trap: boolean;
};

export type TxRetryPct = {
  trap: boolean;
  limit: number;
};

export type Uptime = {
  trap: boolean;
  interval: number;
};

export type RSSI = {
  trap: boolean;
  limit: number;
};

export type RxDrop = {
  trap: boolean;
  limit: number;
};

export type RadioStatus = {
  trap: boolean;
};

export type RxDropPct = {
  trap: boolean;
  limit: number;
};

export type TxRetry = {
  trap: boolean;
  limit: number;
};

export type FreqChange = {
  trap: boolean;
};

export type Alerts = {
  etherstatus: EtherStatus;
  ping: Ping;
  noise: Noise;
  reboot: Reboot;
  txretry_pct: TxRetryPct;
  uptime: Uptime;
  rssi: RSSI;
  rxdrop: RxDrop;
  radiostatus: RadioStatus;
  rxdrop_pct: RxDropPct;
  txretry: TxRetry;
  freqchange: FreqChange;
};

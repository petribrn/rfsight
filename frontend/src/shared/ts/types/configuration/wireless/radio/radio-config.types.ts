import { Vap } from './vap/vap-config.types';

export type Rts = {
  size: number;
  enabled: boolean;
};

export type Channel = {
  extension: string;
  select: 'all' | 'list'; // if list --> a new parameter is added: list: Array<number>
  list_: Array<number> | null;
  width: number;
  offset: number;
  autowidth: boolean;
  bgautochannel: boolean;
};

export type WjetPolling = {
  mbps: number;
  interval: number;
  pps: number;
  count: number;
};

export type Wjet = {
  enabled: boolean;
  version: string;
  polling: Array<WjetPolling>;
};

export type Fragmentation = {
  size: number;
  enabled: boolean;
};

export type Radio = {
  vap: Array<Vap>;
  acktimeout: number;
  ifname: string;
  rts: Rts;
  atpcperiod: number;
  txpower: number;
  channel: Channel;
  missedbeaconlimit: number;
  amsdu: boolean;
  enabled: boolean;
  bawinsize: number;
  atpctarget: number;
  wjet: Wjet;
  fragmentation: Fragmentation;
  atpc: boolean;
  ieeemode: string;
  antennagain: number;
  dfs: boolean;
};

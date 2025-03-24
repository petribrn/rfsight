import { SecurityFailOver } from './security/security-failover-config.types';

export type Recover = {
  timeout: number;
  enabled: boolean;
};

export type BSSIDFailOver = {
  value: string;
  enabled: boolean;
};

export type Failover = {
  recover: Recover;
  bssid: BSSIDFailOver;
  security: SecurityFailOver;
  ssid: string;
  enabled: boolean;
};

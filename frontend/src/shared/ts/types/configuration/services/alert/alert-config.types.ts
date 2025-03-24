import { Alerts } from './alerts/alerts-config.types';

export type SNMPAlert = {
  manager: string;
  timeout: number;
  port: number;
  community: string;
  inform: boolean;
  retry: number;
};

export type Andromeda = {
  enabled: boolean;
};

export type Alert = {
  snmp: SNMPAlert;
  enabled: boolean;
  interval: number;
  alerts: Alerts;
  andromeda: Andromeda;
};

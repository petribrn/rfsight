import { DHCPPool } from '../shared/dhcppool-config.types';

export type DHCPD = {
  enabled: boolean;
  prefix: number;
  staticleases: Array<string>;
  leasetime: number;
  pool: DHCPPool;
  gateway: string;
};

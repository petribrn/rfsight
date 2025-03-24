import { DHCPPool } from '../shared/dhcppool-config.types';

export type DHCP6D = {
  stateful: boolean;
  leasetime: number;
  enabled: boolean;
  prefix: number;
  pool: DHCPPool;
  gateway: string;
};

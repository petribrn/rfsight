import { Management } from './management/management-config.types';
import { Management6 } from './management6/management6-config.types';
import { Vlan } from './vlan/vlan-config.types';
import { VlanTermination } from './vlantermination/vlantermination-config.types';

export type Bridge = {
  management: Management;
  vlantermination: VlanTermination;
  vlan: Vlan;
  stp: boolean;
  ipv6: boolean;
  management6: Management6;
};

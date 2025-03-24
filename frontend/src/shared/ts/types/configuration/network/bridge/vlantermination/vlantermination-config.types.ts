import { Data } from './data/data-config.types';
import { Multicast } from './multicast/multicast-config.types';

export type VlanTermination = {
  data: Data;
  multicast: Multicast;
};

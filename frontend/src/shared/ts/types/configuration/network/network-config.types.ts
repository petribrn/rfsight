import { Bridge } from './bridge/bridge-config.types';
import { Ethernet } from './ethernet/ethernet-config.types';
import { GRE } from './gre/gre-config.types';
import { Router } from './router/router-config.types';
import { Router6 } from './router6/router6-config.types';

export type Network = {
  gre: GRE;
  router6: Router6;
  nat: boolean;
  bridge: Bridge;
  router: Router;
  ethernet: Ethernet;
  topology: string;
};

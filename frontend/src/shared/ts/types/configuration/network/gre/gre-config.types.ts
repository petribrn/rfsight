import { Tunnel } from './tunnel/tunnel-config.types';

export type GRE = {
  tunnel: Array<Tunnel>;
  enabled: boolean;
};

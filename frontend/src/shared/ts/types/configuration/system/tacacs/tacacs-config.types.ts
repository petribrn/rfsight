import { TacacsServer } from './server/tacacsserver-config.types';

export type Tacacs = {
  service: string;
  servers: Array<TacacsServer>;
};

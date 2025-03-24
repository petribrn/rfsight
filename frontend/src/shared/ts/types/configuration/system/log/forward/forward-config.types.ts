import { LogServer } from '../logserver/logserver-confg.types';

export type Forward = {
  server1: LogServer;
  server2: LogServer;
  enabled: boolean;
};

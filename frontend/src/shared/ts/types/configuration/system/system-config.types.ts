import { Authorization } from './authorization/authorization-config.types';
import { DateConfig } from './date/date-config.types';
import { Device } from './device/device-config.types';
import { Log } from './log/log-config.types';
import { PoE } from './poe/poe-config.types';
import { PublicStatus } from './publicstatus/publicstatus-config.types';
import { SimpleMode } from './simplemode/simplemode-config.types';
import { Tacacs } from './tacacs/tacacs-config.types';
import { User } from './user/user-config.types';

export type System = {
  simplemode: SimpleMode;
  publicstatus: PublicStatus;
  authorization: Authorization;
  poe: PoE;
  tacacs: Tacacs;
  users: Array<User>;
  log: Log;
  device: Device;
  date: DateConfig;
};

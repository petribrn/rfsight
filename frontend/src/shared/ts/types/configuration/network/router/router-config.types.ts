import { DMZ } from './dmz/dmz-config.types';
import { Lan } from './lan/lan-config.types';
import { Secondary } from './secondary/secondary-config.types';
import { Wan } from './wan/wan-config.types';

export type Router = {
  routes: [];
  dmz: DMZ;
  portforward: [];
  wan: Wan;
  lan: Lan;
  secondary: Secondary;
};

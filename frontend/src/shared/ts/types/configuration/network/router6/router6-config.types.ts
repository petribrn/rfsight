import { Lan } from './lan/lan-config.types';
import { Wan } from './wan/wan-config.types';

export type Router6 = {
  lan: Lan;
  wan: Wan;
};

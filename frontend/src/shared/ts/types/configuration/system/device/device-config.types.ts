import { Coordinate } from './coordinate/coordinate-config.types';

export type Device = {
  contact: string;
  locale: string;
  firmwareid: string;
  name: string;
  location: string;
  coordinate: Coordinate;
};

import { Radio } from './radio/radio-config.types';

export type Wireless = {
  scenario: string;
  countrycode: string;
  radio: Array<Radio>;
};

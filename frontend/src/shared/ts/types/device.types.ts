import { ActionSequenceResponse } from '../interfaces';
import { Andromeda } from './configuration/andromeda/andromeda-config.types';
import { Network } from './configuration/network/network-config.types';
import { Services } from './configuration/services/services-config.types';
import { System } from './configuration/system/system-config.types';
import { Wireless } from './configuration/wireless/wireless-config.types';

export type ExecuteActionSequenceResponse = Array<ActionSequenceResponse>

export type DeviceData = {
  id: string;
  name: string;
  model: string;
  mac_address: string;
  ip_address: string;
  user: string;
  password: string;
  fw_version: string;
  location: string;
  networkId: string;
  profileId: string;
  configId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DeviceRow = {
  id: string;
  name: string;
  model: string;
  mac_address: string;
  ip_address: string;
  fw_version: string;
  location: string;
  network: string;
  profile: string;
  online: boolean;
  adoptionDate: Date;
  updatedAt: Date;
};

export type DeviceConfig = {
  wireless: Wireless;
  services: Services;
  network: Network;
  system: System;
  andromeda: Andromeda;
};

export type DeviceCollection = {
  devices: Array<DeviceData>;
};

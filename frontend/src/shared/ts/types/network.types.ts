export type NetworkData = {
  id: string;
  name: string;
  network_type: string;
  network_cidr: string;
  location: string;
  devices: Array<string>;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NetworkUpdateData = {
  name?: string;
  network_type?: string;
  network_cidr?: string;
  location?: string;
  devices?: Array<string>;
  organizationId?: string;
};

export type NetworkRow = {
  id: string;
  name: string;
  network_type: string;
  network_cidr: string;
  location: string;
  numberOfDevices: number;
  createdAt: Date;
  updatedAt: Date;
};

export type NetworkCollection = {
  networks: Array<NetworkData>;
};

export type NetworkMetrics = {
  online: number,
  offline: number,
  total: number,
  stations: number,
  avgLatency: number,
  health: number,
};

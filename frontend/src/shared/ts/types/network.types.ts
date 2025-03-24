export type NetworkData = {
  id: string;
  name: string;
  network_type: string;
  location: string;
  devices: Array<string>;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NetworkUpdateData = {
  name?: string;
  network_type?: string;
  location?: string;
  devices?: Array<string>;
  organizationId?: string;
};

export type NetworkRow = {
  id: string;
  name: string;
  network_type: string;
  location: string;
  numberOfDevices: number;
  createdAt: Date;
};

export type NetworkCollection = {
  networks: Array<NetworkData>;
};

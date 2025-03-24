export type Eth0 = {
  enabled: boolean;
};

export type Vlan = {
  enabled: boolean;
  id: number;
  eth0: Eth0;
};

export type Cloud = {
  groupid: string;
  organization: string;
  host: string;
};

export type Andromeda = {
  enabled: boolean;
  mode: string;
  cloud: Cloud;
};

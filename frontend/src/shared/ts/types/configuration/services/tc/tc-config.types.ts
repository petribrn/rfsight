export type Incoming = {
  speed: number;
  burst: number;
  limited: boolean;
};

export type Outgoing = {
  speed: number;
  burst: number;
  limited: boolean;
};

export type Profile = {
  name: string;
  incoming: Incoming;
  outgoing: Outgoing;
};

export type Master = {
  enabled: boolean;
  profiles: Array<Profile>;
};

export type Managed = Master;

export type TC = {
  master: Master;
  managed: Managed;
};

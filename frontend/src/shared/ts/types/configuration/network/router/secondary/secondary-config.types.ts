export type IP = {
  ip: string;
  prefix: number;
};

export type Secondary = {
  enabled: boolean;
  ip: IP;
};

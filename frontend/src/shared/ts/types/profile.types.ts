export type SshDetails = {
  port: number;
  command: string;
};

export type HttpDetails = {
  port: number;
  method: 'GET' | 'PATCH' | 'PUT' | 'POST' | 'DELETE';
  successStatusCode: number;
  path: string;
  pathVariables?: { [key: string]: string | number | boolean };
  payloadType?: 'file' | 'text/plain' | 'text/json';
  responseType: 'text/plain' | 'text/json' | 'boolean' | 'blank';
  responseMapping: { [key: string]: string };
};

export type ProfileActions = { [key: string]: ProfileAction };

export type ProfileAction = {
  actionType: 'monitor' | 'manage';
  protocol: 'http' | 'ssh';
  sshDetails?: SshDetails | null;
  httpDetails?: HttpDetails | null;
};

export type ActionToEdit = {
  name: string;
  actionData: ProfileAction;
};

export type ProfileData = {
  id: string;
  name: string;
  actions: ProfileActions;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfileUpdateData = {
  name?: string;
  actions?: ProfileActions;
};

export type ProfileRow = {
  id: string;
  name: string;
  actions: ProfileActions;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfileCollection = {
  profiles: Array<ProfileData>;
};

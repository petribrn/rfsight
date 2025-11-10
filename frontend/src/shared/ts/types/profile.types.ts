export type SshDetails = {
  port: number;
  command: string;
};

export type HttpDetails = {
  port: number;
  method: 'GET' | 'PATCH' | 'PUT' | 'POST' | 'DELETE';
  successStatusCode: number;
  path: string;
  queryParameters?: { [key: string]: string | number | boolean } | null;
  payloadType?: 'file' | 'text/plain' | 'text/json' | '';
  responseType: 'text/plain' | 'text/json' | 'boolean' | 'blank';
  payloadTemplate?: any;
  responseMapping?: { [key: string]: string } | null;
  responseHeaderMapping?: { [key: string]: string } | null;
};

export type ProfileActions = { [key: string]: ProfileAction };

export type ProfileAction = {
  actionType: 'monitor' | 'manage' | 'auth';
  protocol: 'http' | 'ssh';
  sshDetails?: SshDetails | null;
  httpDetails?: HttpDetails | null;
};

export type ActionToEdit = {
  name: string;
  actionData: ProfileAction;
};

export type StationTable = {
  root_oid: string;
  field_map: { [key: string]: string };
  index_from: null | string | number;
}

export type ProfileData = {
  id: string;
  name: string;
  apiBaseUrl: string;
  stationTable: StationTable;
  actions: ProfileActions;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfileUpdateData = {
  name?: string;
  apiBaseUrl?: string;
  stationTable?: StationTable;
  actions?: ProfileActions;
};

export type ProfileRow = {
  id: string;
  name: string;
  apiBaseUrl: string;
  stationTable: StationTable;
  actions: ProfileActions;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfileCollection = {
  profiles: Array<ProfileData>;
};

export interface IOrganization {
  id: string;
  name: string;
  users: Array<string>;
  networks: Array<string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface INewOrganizationPayload {
  name: string;
  users: Array<string>;
  networks: Array<string>;
}

export interface IOrgUpdate {
  organizationId: string;
  name: string;
}

export interface IOrganizationState {
  organization: IOrganization | null;
}

export type OrganizationData = {
  id: string;
  name: string;
  users: Array<string>;
  networks: Array<string>;
  createdAt: Date;
  updatedAt: Date;
};

export type OrganizationRow = {
  id: string;
  name: string;
  numberOfUsers: number;
  numberOfNetworks: number;
  createdAt: Date;
};

export type OrganizationCollection = {
  organizations: Array<OrganizationData>;
};

export type NewOrganizationResponse = {
  success: boolean;
  organizationId: string;
};
